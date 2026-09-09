"""
SIH26162 API — Pydantic v2 Request / Response Schemas
======================================================
All field-level validation, documentation, and type-safety is
expressed here so app.py stays free of inline validation logic.

Feature order matches feature_schema.json exactly (15 features):
  bright_ti4, bright_ti5, frp, delta_t, daynight,
  distance_to_industry, industries_within_500m, industries_within_1km,
  industries_within_2km, NDVI, NDBI, NDWI,
  cluster_event_count, cluster_unique_dates, cluster_span_days
"""

from __future__ import annotations

from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


# ── Request ──────────────────────────────────────────────────────────────────

class PredictRequest(BaseModel):
    """
    Input payload for POST /predict.

    All 15 model features are accepted.  Fields that are genuinely optional
    in the field environment (e.g. NDWI when water masking is unavailable)
    have safe default values matching the risk_engine.py fallback logic.
    """

    # Optional event identifier — echoed back in the response for traceability
    event_id: Optional[str] = Field(
        default=None,
        description="Optional unique identifier for this thermal event (e.g. 'FIRMS_0152').",
        examples=["FIRMS_0152"],
    )

    # ── Thermal Signature ────────────────────────────────────────────────────
    bright_ti4: float = Field(
        ...,
        ge=200.0,
        le=500.0,
        description=(
            "VIIRS I-Band 4 (Mid-Wave IR) brightness temperature in Kelvin. "
            "Ambient background ~295 K; active flames typically > 320 K."
        ),
        examples=[355.2],
    )
    bright_ti5: float = Field(
        ...,
        ge=200.0,
        le=400.0,
        description=(
            "VIIRS I-Band 5 (Long-Wave IR) brightness temperature in Kelvin. "
            "Used with bright_ti4 to compute sub-pixel combustion contrast."
        ),
        examples=[302.1],
    )
    frp: float = Field(
        ...,
        ge=0.0,
        description=(
            "Fire Radiative Power in megawatts (MW). "
            "Low rural burns: 1–5 MW. Severe industrial combustion: > 15 MW."
        ),
        examples=[18.5],
    )
    delta_t: float = Field(
        default=0.0,
        ge=0.0,
        description=(
            "Brightness temperature difference (bright_ti4 − bright_ti5) in Kelvin. "
            "High values (> 30 K) indicate intense sub-pixel combustion. "
            "Computed automatically if not supplied."
        ),
        examples=[53.1],
    )

    # ── Acquisition Metadata ─────────────────────────────────────────────────
    daynight: Literal[0, 1] = Field(
        default=1,
        description=(
            "Day/Night flag: 0 = night-time satellite overpass, 1 = daytime. "
            "Night detections eliminate solar reflection contamination."
        ),
        examples=[0],
    )

    # ── Industrial Proximity ─────────────────────────────────────────────────
    distance_to_industry: float = Field(
        default=5000.0,
        ge=0.0,
        description=(
            "Straight-line distance in metres to the nearest registered "
            "industrial boundary polygon (GIDC / OSM industrial landuse)."
        ),
        examples=[120.0],
    )
    industries_within_500m: int = Field(
        default=0,
        ge=0,
        description="Count of distinct industrial facilities within a 500 m radius.",
        examples=[3],
    )
    industries_within_1km: int = Field(
        default=0,
        ge=0,
        description="Count of distinct industrial facilities within a 1 km radius.",
        examples=[5],
    )
    industries_within_2km: int = Field(
        default=0,
        ge=0,
        description="Count of distinct industrial facilities within a 2 km radius.",
        examples=[14],
    )

    # ── Spectral Indices (Sentinel-2) ────────────────────────────────────────
    NDVI: float = Field(
        default=0.3,
        ge=-1.0,
        le=1.0,
        description=(
            "Normalised Difference Vegetation Index from co-registered Sentinel-2. "
            "High values (> 0.4) indicate dense vegetation; low or negative values "
            "indicate bare soil, built-up, or burned areas."
        ),
        examples=[0.12],
    )
    NDBI: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description=(
            "Normalised Difference Built-up Index. "
            "Positive values indicate impervious/built-up surfaces."
        ),
        examples=[0.22],
    )
    NDWI: float = Field(
        default=0.0,
        ge=-1.0,
        le=1.0,
        description=(
            "Normalised Difference Water Index. "
            "Positive values indicate open water; used for water-body masking."
        ),
        examples=[-0.31],
    )

    # ── Temporal Cluster Statistics ──────────────────────────────────────────
    cluster_event_count: int = Field(
        default=1,
        ge=1,
        description=(
            "Total number of VIIRS hotspot detections within a 500 m spatial cluster "
            "across the full observation window."
        ),
        examples=[16],
    )
    cluster_unique_dates: int = Field(
        default=1,
        ge=1,
        description=(
            "Number of unique calendar dates on which the cluster was observed. "
            "Distinguishes persistent sources (many dates) from episodic burns (1 date)."
        ),
        examples=[12],
    )
    cluster_span_days: int = Field(
        default=0,
        ge=0,
        description=(
            "Calendar days elapsed between the first and last detection in the cluster. "
            "0 = single-day event; 80+ = long-running persistent industrial source."
        ),
        examples=[45],
    )

    @field_validator("frp", mode="before")
    @classmethod
    def frp_must_be_non_negative(cls, v: float) -> float:
        if float(v) < 0:
            raise ValueError("frp must be ≥ 0 (Fire Radiative Power cannot be negative).")
        return v

    @model_validator(mode="after")
    def auto_compute_delta_t(self) -> "PredictRequest":
        """If delta_t is the default (0.0) and ti4 > ti5, derive it automatically."""
        if self.delta_t == 0.0 and self.bright_ti4 > self.bright_ti5:
            self.delta_t = round(self.bright_ti4 - self.bright_ti5, 4)
        return self

    model_config = {
        "json_schema_extra": {
            "example": {
                "event_id": "FIRMS_0055",
                "bright_ti4": 355.2,
                "bright_ti5": 302.1,
                "frp": 18.5,
                "delta_t": 53.1,
                "daynight": 0,
                "distance_to_industry": 120.0,
                "industries_within_500m": 3,
                "industries_within_1km": 5,
                "industries_within_2km": 14,
                "NDVI": 0.12,
                "NDBI": 0.22,
                "NDWI": -0.31,
                "cluster_event_count": 16,
                "cluster_unique_dates": 12,
                "cluster_span_days": 45,
            }
        }
    }


# ── Sub-objects ───────────────────────────────────────────────────────────────

class SHAPContribution(BaseModel):
    """A single feature's SHAP contribution to the predicted class."""

    feature: str = Field(description="Feature name (matches feature_schema.json).")
    feature_value: float = Field(description="Actual input value for this feature.")
    shap_value: float = Field(
        description=(
            "SHAP contribution in log-odds units. "
            "Positive → pushes prediction TOWARD the predicted class. "
            "Negative → pushes prediction AWAY from the predicted class."
        )
    )
    direction: Literal[
        "pushes TOWARD predicted class",
        "pushes AWAY from predicted class",
    ] = Field(description="Human-readable influence direction.")


# ── Response ──────────────────────────────────────────────────────────────────

class PredictResponse(BaseModel):
    """Unified response from POST /predict."""

    # ── Identification ───────────────────────────────────────────────────────
    event_id: Optional[str] = Field(
        default=None,
        description="Echo of the event_id from the request (null if not supplied).",
    )

    # ── Classification ───────────────────────────────────────────────────────
    predicted_class: str = Field(
        description=(
            "Predicted thermal anomaly class. One of: "
            "'Persistent Industrial Heat', 'Industrial Fire', "
            "'Gas Flare', 'Other Thermal Source'."
        )
    )
    confidence: float = Field(
        description="Model's predicted probability for the predicted class (0.0 – 1.0)."
    )
    class_probabilities: Dict[str, float] = Field(
        description="Full probability distribution across all four classes."
    )

    # ── Risk Sub-Scores ──────────────────────────────────────────────────────
    thermal_score: float = Field(
        description="Thermal Severity sub-score (0–100). Driven by FRP, bright_ti4, delta_t."
    )
    persistence_score: float = Field(
        description="Temporal Persistence sub-score (0–100). Driven by cluster_span_days, cluster_unique_dates."
    )
    industrial_proximity_score: float = Field(
        description="Industrial Proximity sub-score (0–100). Driven by distance_to_industry, density, NDBI."
    )
    recurrence_score: float = Field(
        description="Recurrence Pattern sub-score (0–100). Driven by cluster_event_count, daynight."
    )
    ml_confidence_score: float = Field(
        description="ML Hazard Multiplier sub-score (0–100). Class hazard weight × model confidence × 100."
    )

    # ── Composite Risk ───────────────────────────────────────────────────────
    final_risk_score: float = Field(
        description=(
            "Composite weighted risk score (0–100). "
            "Formula: 0.25×Thermal + 0.25×Proximity + 0.25×ML + 0.15×Persistence + 0.10×Recurrence."
        )
    )
    risk_level: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"] = Field(
        description="Risk tier: LOW (0–24), MODERATE (25–49), HIGH (50–74), CRITICAL (75–100)."
    )
    top_risk_factors: str = Field(
        description="Human-readable sentence summarising the top 1–3 driving risk factors."
    )

    # ── Explainability ───────────────────────────────────────────────────────
    top_shap_explanations: List[SHAPContribution] = Field(
        description=(
            "Top-5 SHAP feature contributions for the predicted class, "
            "sorted by absolute SHAP value descending."
        )
    )


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    """Response from GET /health."""

    status: Literal["ok", "degraded"] = Field(
        description="'ok' if all model artifacts are loaded; 'degraded' if startup failed."
    )
    model_loaded: bool = Field(description="True when the XGBoost model bundle is ready.")
    classes: List[str] = Field(
        description="The four classification target classes in label-encoded order."
    )
    num_features: int = Field(description="Number of model input features expected (15).")
    version: str = Field(description="API version string.")


# ── Error ────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    """Returned for unexpected server errors (HTTP 500)."""

    error: str = Field(description="Error type / name.")
    detail: str = Field(description="Human-readable error detail.")
