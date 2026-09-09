"""
SIH26162 — Model Bundle Singleton Loader
=========================================
Loads all ML artifacts exactly once at API startup and caches them.
All downstream API routes consume the returned ModelBundle without
re-reading disk on every request.

Artifacts loaded:
  data/models/xgboost_model.pkl     — Trained XGBoost multiclass classifier
  data/models/label_encoder.pkl     — sklearn LabelEncoder (4 classes)
  data/models/feature_schema.json   — Ordered feature list + dtype mapping

IMPORTANT: This module must NOT modify any model artifact.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

import joblib
import numpy as np
import shap

logger = logging.getLogger(__name__)

# ── Resolve artifact paths relative to project root ─────────────────────────
_HERE = Path(__file__).resolve()
PROJECT_ROOT = _HERE.parent.parent.parent          # …/SIH 26/
MODELS_DIR = PROJECT_ROOT / "data" / "models"

_MODEL_PATH   = MODELS_DIR / "xgboost_model.pkl"
_ENCODER_PATH = MODELS_DIR / "label_encoder.pkl"
_SCHEMA_PATH  = MODELS_DIR / "feature_schema.json"

API_VERSION = "1.0.0"


@dataclass
class ModelBundle:
    """Immutable container for all ML inference artifacts."""
    model:         object                  # XGBoost Booster / sklearn wrapper
    label_encoder: object                  # sklearn LabelEncoder
    feature_names: List[str]               # ordered feature list (15 features)
    class_names:   List[str]               # ordered class labels (4 classes)
    explainer:     object                  # shap.TreeExplainer (cached)
    version:       str = API_VERSION


# ── Module-level singleton ──────────────────────────────────────────────────
_bundle: Optional[ModelBundle] = None


def load_model_bundle() -> ModelBundle:
    """
    Load and cache the ModelBundle.  Call this once at application startup.

    Raises:
        RuntimeError: If any model artifact file is missing or fails to load.
    """
    global _bundle

    if _bundle is not None:
        return _bundle

    # 1. Validate file existence before attempting deserialization
    for path in (_MODEL_PATH, _ENCODER_PATH, _SCHEMA_PATH):
        if not path.exists():
            raise RuntimeError(
                f"Required model artifact not found: {path}\n"
                "Run the XGBoost training script first: "
                "python scripts/train_xgboost.py"
            )

    logger.info("Loading XGBoost model from %s …", _MODEL_PATH)
    model = joblib.load(_MODEL_PATH)

    logger.info("Loading LabelEncoder from %s …", _ENCODER_PATH)
    le = joblib.load(_ENCODER_PATH)

    logger.info("Loading feature schema from %s …", _SCHEMA_PATH)
    with open(_SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    feature_names: List[str] = schema["feature_names"]
    class_names: List[str]   = list(le.classes_)

    logger.info("Initialising SHAP TreeExplainer (cached) …")
    explainer = shap.TreeExplainer(model)

    _bundle = ModelBundle(
        model=model,
        label_encoder=le,
        feature_names=feature_names,
        class_names=class_names,
        explainer=explainer,
    )

    logger.info(
        "ModelBundle ready — %d features, %d classes: %s",
        len(feature_names),
        len(class_names),
        class_names,
    )
    return _bundle


def get_model_bundle() -> ModelBundle:
    """
    FastAPI dependency: returns the cached ModelBundle.

    Raises:
        RuntimeError: If `load_model_bundle()` was never called (startup failed).
    """
    if _bundle is None:
        raise RuntimeError(
            "ModelBundle has not been initialised. "
            "Ensure load_model_bundle() is called during application lifespan startup."
        )
    return _bundle


def reset_bundle() -> None:
    """Reset the cached bundle (used in tests to reload with a fresh state)."""
    global _bundle
    _bundle = None
