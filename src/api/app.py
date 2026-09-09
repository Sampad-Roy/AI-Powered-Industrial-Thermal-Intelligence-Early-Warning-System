"""
SIH26162 — FastAPI Application
================================
Endpoints:
  GET  /health    — Liveness + readiness check
  POST /predict   — Full inference: XGBoost classification + Risk Score + SHAP top-5

Design principles:
  - Model bundle loaded ONCE in the async lifespan (not per-request).
  - Reuses src.risk.risk_engine.evaluate_event_risk() unchanged.
  - SHAP explanations computed per-request for the single predicted class.
  - All model artifacts untouched; no ground-truth labels used at inference.
"""

from __future__ import annotations

import logging
import sys
import os
from contextlib import asynccontextmanager
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ── Ensure project root is on sys.path so src.* imports resolve ──────────────
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from src.api.model_loader import load_model_bundle, get_model_bundle
from src.api.schemas import (
    ErrorResponse,
    HealthResponse,
    PredictRequest,
    PredictResponse,
    SHAPContribution,
)
from src.risk.risk_engine import evaluate_event_risk

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s — %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("sih26162.api")


# ── Lifespan: load model bundle once at startup ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML artifacts before the server starts accepting requests."""
    logger.info("=== SIH26162 API starting up — loading model bundle … ===")
    try:
        bundle = load_model_bundle()
        logger.info(
            "Model bundle ready: %d features, classes = %s",
            len(bundle.feature_names),
            bundle.class_names,
        )
    except RuntimeError as exc:
        # Server starts in degraded mode — /health will report the failure
        logger.error("Model bundle failed to load: %s", exc)

    yield  # ← application runs here

    logger.info("=== SIH26162 API shutting down. ===")


# ── Application ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="SIH26162 — Thermal Anomaly Classification & Risk API",
    description=(
        "AI-based detection and classification of Industrial Fires, Persistent Thermal Sources, "
        "Gas Flares, and Agricultural Burns from VIIRS satellite data.\n\n"
        "**Model**: XGBoost multiclass classifier (4 classes, 15 features).\n"
        "**Risk Engine**: Transparent 5-component weighted score (0–100).\n"
        "**Explainability**: SHAP top-5 feature contributions per prediction."
    ),
    version="1.0.0",
    contact={"name": "SIH26162 Team"},
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow all origins (adjust for production deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error=type(exc).__name__,
            detail=str(exc),
        ).model_dump(),
    )


# ── /health ───────────────────────────────────────────────────────────────────
@app.get(
    "/health",
    response_model=HealthResponse,
    summary="API liveness and model readiness check",
    tags=["Monitoring"],
)
def health_check() -> HealthResponse:
    """
    Returns the operational status of the API and its ML model bundle.

    - **status**: `"ok"` when fully operational; `"degraded"` if model loading failed.
    - **model_loaded**: `true` when the XGBoost model is in memory and ready.
    - **classes**: The four classification target classes.
    - **num_features**: Number of expected input features (15).
    - **version**: API version string.
    """
    try:
        bundle = get_model_bundle()
        return HealthResponse(
            status="ok",
            model_loaded=True,
            classes=bundle.class_names,
            num_features=len(bundle.feature_names),
            version=bundle.version,
        )
    except RuntimeError:
        return HealthResponse(
            status="degraded",
            model_loaded=False,
            classes=[],
            num_features=0,
            version="1.0.0",
        )


# ── /predict ──────────────────────────────────────────────────────────────────
@app.post(
    "/predict",
    response_model=PredictResponse,
    summary="Classify a thermal event and compute its risk score",
    tags=["Inference"],
    responses={
        422: {"description": "Validation error — invalid or missing required feature values."},
        503: {"description": "Model not loaded — server in degraded state."},
    },
)
def predict(payload: PredictRequest) -> PredictResponse:
    """
    Accepts one set of satellite feature values and returns:

    1. **Predicted class** (one of 4 thermal anomaly categories) + confidence.
    2. **Full class probability distribution**.
    3. **5-component risk sub-scores** and a **composite Risk Score (0–100)**.
    4. **Risk Level** (LOW / MODERATE / HIGH / CRITICAL).
    5. **Top-5 SHAP feature explanations** for the predicted class.

    ### Feature Requirements
    - **Required**: `bright_ti4`, `bright_ti5`, `frp`
    - **Computed if omitted**: `delta_t` (auto-derived from ti4 − ti5)
    - **Optional with defaults**: all remaining 11 features

    ### Class Hazard Hierarchy
    | Class | Operational Priority |
    |---|---|
    | Industrial Fire | CRITICAL emergency |
    | Gas Flare | High continuous hazard |
    | Persistent Industrial Heat | Chronic monitoring |
    | Other Thermal Source | Routine / non-industrial |
    """
    # 1. Retrieve cached model bundle
    try:
        bundle = get_model_bundle()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model bundle not available: {exc}",
        )

    # 2. Assemble feature vector in schema-defined order
    feature_values: List[float] = [
        getattr(payload, feat) for feat in bundle.feature_names
    ]
    X = np.array(feature_values, dtype=np.float64).reshape(1, -1)
    X_df = pd.DataFrame(X, columns=bundle.feature_names)

    # 3. XGBoost inference
    probs: np.ndarray = bundle.model.predict_proba(X_df)[0]         # shape: (4,)
    pred_idx: int = int(np.argmax(probs))
    predicted_class: str = bundle.class_names[pred_idx]
    confidence: float = float(probs[pred_idx])
    class_probabilities: Dict[str, float] = {
        cls: round(float(p), 6) for cls, p in zip(bundle.class_names, probs)
    }

    # 4. Risk scoring — reuse existing engine untouched
    event_dict: Dict[str, Any] = payload.model_dump()
    event_dict["predicted_class"] = predicted_class
    event_dict["confidence"] = confidence
    # Map field aliases that risk_engine.py accepts
    event_dict["FRP"] = payload.frp
    event_dict["delta_ti4_ti5"] = payload.delta_t
    event_dict["nearest_industry_distance_m"] = payload.distance_to_industry

    risk_result = evaluate_event_risk(event_dict)

    # 5. SHAP local explanation for the predicted class
    shap_contributions = _compute_shap_top5(
        bundle=bundle,
        X_df=X_df,
        predicted_class=predicted_class,
    )

    return PredictResponse(
        event_id=payload.event_id,
        predicted_class=predicted_class,
        confidence=round(confidence, 6),
        class_probabilities=class_probabilities,
        thermal_score=risk_result["thermal_score"],
        persistence_score=risk_result["persistence_score"],
        industrial_proximity_score=risk_result["industrial_proximity_score"],
        recurrence_score=risk_result["recurrence_score"],
        ml_confidence_score=risk_result["ml_confidence_score"],
        final_risk_score=risk_result["final_risk_score"],
        risk_level=risk_result["risk_level"],
        top_risk_factors=risk_result["top_risk_factors"],
        top_shap_explanations=shap_contributions,
    )


# ── SHAP helper ───────────────────────────────────────────────────────────────
def _compute_shap_top5(
    bundle,
    X_df: pd.DataFrame,
    predicted_class: str,
) -> List[SHAPContribution]:
    """
    Compute SHAP values for a single event and extract the top-5 contributors
    for the predicted class, sorted by absolute SHAP value (descending).
    """
    shap_values = bundle.explainer.shap_values(X_df)

    # shap_values may be list[ndarray] (older SHAP) or ndarray of shape (1, n_feat, n_classes)
    class_idx = bundle.class_names.index(predicted_class)

    if isinstance(shap_values, list):
        # list of (n_samples, n_features) arrays, one per class
        sv_for_class: np.ndarray = shap_values[class_idx][0]   # shape (n_features,)
    elif shap_values.ndim == 3:
        # (n_samples, n_features, n_classes)
        sv_for_class = shap_values[0, :, class_idx]
    else:
        # Fallback: binary / single-output
        sv_for_class = shap_values[0]

    feature_values_row = X_df.iloc[0].values
    abs_shap = np.abs(sv_for_class)
    top5_idx = np.argsort(abs_shap)[::-1][:5]

    contributions: List[SHAPContribution] = []
    for idx in top5_idx:
        sv = float(sv_for_class[idx])
        contributions.append(
            SHAPContribution(
                feature=bundle.feature_names[idx],
                feature_value=round(float(feature_values_row[idx]), 6),
                shap_value=round(sv, 6),
                direction=(
                    "pushes TOWARD predicted class"
                    if sv >= 0
                    else "pushes AWAY from predicted class"
                ),
            )
        )
    return contributions


# ── /events ───────────────────────────────────────────────────────────────────
_CACHED_EVENTS_CATALOG = None

@app.get(
    "/events",
    summary="Get all validated VIIRS satellite thermal events with AI classifications and risk scores",
    tags=["Catalog"],
)
def get_all_events() -> List[Dict[str, Any]]:
    """
    Returns all validated satellite thermal anomaly events from AI_READY_DATASET.csv,
    annotated with live XGBoost predictions, probability distributions, 5-factor risk scores,
    and SHAP feature explanations.
    """
    global _CACHED_EVENTS_CATALOG
    if _CACHED_EVENTS_CATALOG is not None:
        return _CACHED_EVENTS_CATALOG

    dataset_path = os.path.join(_PROJECT_ROOT, "data", "processed", "AI_READY_DATASET.csv")
    if not os.path.exists(dataset_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset not found at {dataset_path}",
        )

    try:
        bundle = get_model_bundle()
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model bundle not available: {exc}",
        )

    df = pd.read_csv(dataset_path)
    if "FRP" in df.columns and "frp" not in df.columns:
        df["frp"] = df["FRP"]
    events_list: List[Dict[str, Any]] = []

    # Prepare feature matrix for batch prediction
    feature_matrix = df[bundle.feature_names].copy()
    all_probs = bundle.model.predict_proba(feature_matrix)

    for idx, row in df.iterrows():
        probs = all_probs[idx]
        pred_idx = int(np.argmax(probs))
        predicted_class = bundle.class_names[pred_idx]
        confidence = float(probs[pred_idx])
        class_probabilities = {
            cls: round(float(p), 6) for cls, p in zip(bundle.class_names, probs)
        }

        # Evaluate risk score
        row_dict = row.to_dict()
        row_dict["predicted_class"] = predicted_class
        row_dict["confidence"] = confidence
        row_dict["FRP"] = float(row.get("FRP", row.get("frp", 0.0)))
        row_dict["delta_ti4_ti5"] = float(row.get("delta_t", 0.0))
        row_dict["nearest_industry_distance_m"] = float(row.get("distance_to_industry", 0.0))

        risk_result = evaluate_event_risk(row_dict)

        # Compute SHAP top-5 for this event
        row_feat_df = pd.DataFrame([feature_matrix.iloc[idx]], columns=bundle.feature_names)
        shap_contributions = _compute_shap_top5(
            bundle=bundle,
            X_df=row_feat_df,
            predicted_class=predicted_class,
        )

        event_obj = {
            "event_id": str(row.get("event_id", f"FIRMS_{idx:04d}")),
            "latitude": float(row.get("latitude", 0.0)),
            "longitude": float(row.get("longitude", 0.0)),
            "acq_datetime": str(row.get("acq_datetime", "")),
            "bright_ti4": float(row.get("bright_ti4", 0.0)),
            "bright_ti5": float(row.get("bright_ti5", 0.0)),
            "frp": float(row.get("FRP", row.get("frp", 0.0))),
            "delta_t": float(row.get("delta_t", 0.0)),
            "distance_to_industry": float(row.get("distance_to_industry", 0.0)),
            "industries_within_500m": int(row.get("industries_within_500m", 0)),
            "industries_within_1km": int(row.get("industries_within_1km", 0)),
            "industries_within_2km": int(row.get("industries_within_2km", 0)),
            "cluster_id": int(row.get("cluster_id", 0)),
            "cluster_event_count": int(row.get("cluster_event_count", 1)),
            "cluster_unique_dates": int(row.get("cluster_unique_dates", 1)),
            "cluster_span_days": int(row.get("cluster_span_days", 0)),
            "daynight": int(row.get("daynight", 0)),
            "NDVI": float(row.get("NDVI", 0.0)),
            "NDBI": float(row.get("NDBI", 0.0)),
            "NDWI": float(row.get("NDWI", 0.0)),
            "final_label": str(row.get("final_label", "")),
            "predicted_class": predicted_class,
            "confidence": round(confidence, 6),
            "class_probabilities": class_probabilities,
            "thermal_score": risk_result["thermal_score"],
            "persistence_score": risk_result["persistence_score"],
            "industrial_proximity_score": risk_result["industrial_proximity_score"],
            "recurrence_score": risk_result["recurrence_score"],
            "ml_confidence_score": risk_result["ml_confidence_score"],
            "final_risk_score": risk_result["final_risk_score"],
            "risk_level": risk_result["risk_level"],
            "top_risk_factors": risk_result["top_risk_factors"],
            "top_shap_explanations": [c.model_dump() for c in shap_contributions],
        }
        events_list.append(event_obj)

    _CACHED_EVENTS_CATALOG = events_list
    return _CACHED_EVENTS_CATALOG

