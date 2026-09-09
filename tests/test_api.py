"""
SIH26162 API Test Suite
========================
Tests the FastAPI /health and /predict endpoints using FastAPI's
built-in TestClient (no live server required — synchronous execution).

Run with:
    python tests/test_api.py

All 6 test cases cover:
  1. Health endpoint schema validation
  2. Full predict round-trip (industrial heat scenario)
  3. Agricultural burn → LOW risk assertion
  4. Minimal payload (optional fields omitted → safe defaults)
  5. Invalid FRP (negative) → 422 Unprocessable Entity
  6. Response schema completeness check
"""

from __future__ import annotations

import os
import sys

# Ensure project root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

# ── Load model bundle BEFORE creating the TestClient ─────────────────────────
# TestClient does not trigger the async lifespan, so we prime the singleton
# here exactly as the lifespan would do on a real server start.
from src.api.model_loader import load_model_bundle, reset_bundle
load_model_bundle()

from src.api.app import app

client = TestClient(app, raise_server_exceptions=True)

# ─────────────────────────────────────────────────────────────────────────────
# Shared payloads
# ─────────────────────────────────────────────────────────────────────────────

INDUSTRIAL_HEAT_PAYLOAD = {
    "event_id": "TEST_HEAT_001",
    "bright_ti4": 355.2,
    "bright_ti5": 302.1,
    "frp": 3.5,
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

AGRICULTURAL_BURN_PAYLOAD = {
    "event_id": "TEST_AGRI_001",
    "bright_ti4": 322.0,
    "bright_ti5": 307.0,
    "frp": 2.8,
    "delta_t": 15.0,
    "daynight": 1,
    "distance_to_industry": 6200.0,
    "industries_within_500m": 0,
    "industries_within_1km": 0,
    "industries_within_2km": 0,
    "NDVI": 0.48,
    "NDBI": -0.12,
    "NDWI": 0.05,
    "cluster_event_count": 1,
    "cluster_unique_dates": 1,
    "cluster_span_days": 0,
}

REQUIRED_ONLY_PAYLOAD = {
    # Only the three truly required fields; everything else uses defaults
    "bright_ti4": 340.0,
    "bright_ti5": 305.0,
    "frp": 5.0,
}

RESPONSE_REQUIRED_KEYS = {
    "predicted_class",
    "confidence",
    "class_probabilities",
    "thermal_score",
    "persistence_score",
    "industrial_proximity_score",
    "recurrence_score",
    "ml_confidence_score",
    "final_risk_score",
    "risk_level",
    "top_risk_factors",
    "top_shap_explanations",
}

VALID_CLASSES = {
    "Persistent Industrial Heat",
    "Industrial Fire",
    "Gas Flare",
    "Other Thermal Source",
}

VALID_RISK_LEVELS = {"LOW", "MODERATE", "HIGH", "CRITICAL"}


# ─────────────────────────────────────────────────────────────────────────────
# Test 1 — Health endpoint
# ─────────────────────────────────────────────────────────────────────────────

def test_health_returns_ok():
    resp = client.get("/health")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()
    assert body["status"] in ("ok", "degraded"), f"Unexpected status: {body['status']}"
    assert isinstance(body["model_loaded"], bool)
    assert isinstance(body["classes"], list)
    assert isinstance(body["num_features"], int)
    assert "version" in body

    if body["status"] == "ok":
        assert body["model_loaded"] is True
        assert len(body["classes"]) == 4
        assert body["num_features"] == 15
        for cls in body["classes"]:
            assert cls in VALID_CLASSES, f"Unknown class in health response: {cls}"

    print(f"  [health] status={body['status']}  classes={body['classes']}")


# ─────────────────────────────────────────────────────────────────────────────
# Test 2 — Full predict round-trip: industrial scenario
# ─────────────────────────────────────────────────────────────────────────────

def test_predict_industrial_heat():
    resp = client.post("/predict", json=INDUSTRIAL_HEAT_PAYLOAD)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()

    assert body["event_id"] == "TEST_HEAT_001"
    assert body["predicted_class"] in VALID_CLASSES
    assert 0.0 <= body["confidence"] <= 1.0
    assert body["risk_level"] in VALID_RISK_LEVELS
    assert 0.0 <= body["final_risk_score"] <= 100.0

    # Long-span dense industrial event should not be LOW
    assert body["risk_level"] in ("MODERATE", "HIGH", "CRITICAL"), (
        f"Dense industrial event scored {body['risk_level']} ({body['final_risk_score']:.1f}) — "
        "expected MODERATE, HIGH, or CRITICAL."
    )

    print(
        f"  [predict/industrial] class={body['predicted_class']}  "
        f"conf={body['confidence']:.3f}  risk={body['final_risk_score']:.1f}  "
        f"level={body['risk_level']}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Test 3 — Agricultural burn → LOW risk
# ─────────────────────────────────────────────────────────────────────────────

def test_predict_agricultural_burn():
    resp = client.post("/predict", json=AGRICULTURAL_BURN_PAYLOAD)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    body = resp.json()

    assert body["risk_level"] == "LOW", (
        f"Remote agricultural burn should be LOW risk, "
        f"got {body['risk_level']} ({body['final_risk_score']:.1f})."
    )
    assert body["final_risk_score"] < 25.0

    print(
        f"  [predict/agri] class={body['predicted_class']}  "
        f"conf={body['confidence']:.3f}  risk={body['final_risk_score']:.1f}  "
        f"level={body['risk_level']}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Test 4 — Minimal payload (optional fields omitted)
# ─────────────────────────────────────────────────────────────────────────────

def test_predict_missing_optional_fields():
    resp = client.post("/predict", json=REQUIRED_ONLY_PAYLOAD)
    assert resp.status_code == 200, (
        f"Minimal payload should succeed with defaults, "
        f"got {resp.status_code}: {resp.text}"
    )
    body = resp.json()
    assert body["predicted_class"] in VALID_CLASSES
    assert body["event_id"] is None   # not supplied
    assert body["risk_level"] in VALID_RISK_LEVELS

    print(
        f"  [predict/minimal] class={body['predicted_class']}  "
        f"risk={body['final_risk_score']:.1f}  level={body['risk_level']}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Test 5 — Invalid FRP (negative) → 422
# ─────────────────────────────────────────────────────────────────────────────

def test_predict_invalid_frp():
    bad_payload = {**REQUIRED_ONLY_PAYLOAD, "frp": -5.0}
    resp = client.post("/predict", json=bad_payload)
    assert resp.status_code == 422, (
        f"Negative FRP should return 422 Unprocessable Entity, got {resp.status_code}."
    )
    print(f"  [predict/invalid_frp] correctly rejected with HTTP {resp.status_code}")


# ─────────────────────────────────────────────────────────────────────────────
# Test 6 — Response schema completeness
# ─────────────────────────────────────────────────────────────────────────────

def test_predict_response_schema():
    resp = client.post("/predict", json=INDUSTRIAL_HEAT_PAYLOAD)
    assert resp.status_code == 200
    body = resp.json()

    missing = RESPONSE_REQUIRED_KEYS - set(body.keys())
    assert not missing, f"Response missing required keys: {missing}"

    # SHAP explanations: list of contributions, each with required sub-fields
    shap_list = body["top_shap_explanations"]
    assert isinstance(shap_list, list), "top_shap_explanations must be a list."
    assert len(shap_list) > 0, "top_shap_explanations must not be empty."
    for contrib in shap_list:
        for key in ("feature", "feature_value", "shap_value", "direction"):
            assert key in contrib, f"SHAP contribution missing key: {key}"
        assert contrib["direction"] in (
            "pushes TOWARD predicted class",
            "pushes AWAY from predicted class",
        ), f"Unexpected direction value: {contrib['direction']}"

    # Sub-scores all within [0, 100]
    for field in (
        "thermal_score", "persistence_score", "industrial_proximity_score",
        "recurrence_score", "ml_confidence_score", "final_risk_score"
    ):
        val = body[field]
        assert 0.0 <= val <= 100.0, f"{field} = {val} is outside [0, 100]."

    # class_probabilities sums to ≈1.0
    prob_sum = sum(body["class_probabilities"].values())
    assert abs(prob_sum - 1.0) < 0.01, f"Probabilities sum to {prob_sum:.4f}, expected ≈1.0."

    print(
        f"  [predict/schema] all {len(RESPONSE_REQUIRED_KEYS)} required keys present  "
        f"shap_count={len(shap_list)}  prob_sum={prob_sum:.4f}"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Standalone runner
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    tests = [
        ("test_health_returns_ok",           test_health_returns_ok),
        ("test_predict_industrial_heat",      test_predict_industrial_heat),
        ("test_predict_agricultural_burn",    test_predict_agricultural_burn),
        ("test_predict_missing_optional_fields", test_predict_missing_optional_fields),
        ("test_predict_invalid_frp",          test_predict_invalid_frp),
        ("test_predict_response_schema",      test_predict_response_schema),
    ]

    print("\nRunning SIH26162 API Test Suite …\n" + "=" * 56)
    passed = 0
    failed = 0
    for name, fn in tests:
        try:
            fn()
            print(f"[PASS] {name}")
            passed += 1
        except AssertionError as exc:
            print(f"[FAIL] {name}\n       {exc}")
            failed += 1
        except Exception as exc:
            print(f"[ERROR] {name}\n        {type(exc).__name__}: {exc}")
            failed += 1

    print("=" * 56)
    print(f"\nResults: {passed} passed, {failed} failed out of {len(tests)} tests.")
    if failed:
        sys.exit(1)
    else:
        print("ALL TESTS PASSED.")
