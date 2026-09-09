"""
Unit tests for the SIH26162 Multi-Factor Risk Scoring Engine.
Tests:
- Score range strictly [0, 100]
- Correct risk-level boundaries (LOW, MODERATE, HIGH, CRITICAL)
- Missing feature and NaN handling
- Determinism and reproducibility
- High-hazard vs low-hazard discrimination
- Batch evaluation functionality
"""

import os
import sys
import math
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.risk.risk_engine import (
    compute_thermal_score,
    compute_persistence_score,
    compute_proximity_score,
    compute_recurrence_score,
    compute_ml_confidence_score,
    get_risk_level,
    evaluate_event_risk,
    compute_dataset_risk_scores,
    CLASS_HAZARD_WEIGHTS,
    DEFAULT_COMPONENT_WEIGHTS
)


class TestRiskEngineBounds:
    """Verifies that all sub-scores and composite scores stay strictly in [0, 100]."""

    def test_thermal_score_bounds(self):
        # Extreme negative, zero, nominal, extreme high
        assert compute_thermal_score(frp=-10, bright_ti4=200, bright_ti5=300, delta_t=-50) == 0.0
        assert compute_thermal_score(frp=0, bright_ti4=295, bright_ti5=295, delta_t=0) == 0.0
        assert compute_thermal_score(frp=1000, bright_ti4=500, bright_ti5=200, delta_t=300) == 100.0

        for frp in [0.0, 5.0, 15.0, 30.0, 100.0]:
            for ti4 in [295.0, 320.0, 350.0, 370.0, 400.0]:
                for dt in [0.0, 10.0, 30.0, 50.0, 80.0]:
                    s = compute_thermal_score(frp=frp, bright_ti4=ti4, delta_t=dt)
                    assert 0.0 <= s <= 100.0

    def test_persistence_score_bounds(self):
        assert compute_persistence_score(cluster_span_days=-10, cluster_unique_dates=-5) == 0.0
        assert compute_persistence_score(cluster_span_days=0, cluster_unique_dates=1) == 0.0
        assert compute_persistence_score(cluster_span_days=80, cluster_unique_dates=20) == 100.0
        assert compute_persistence_score(cluster_span_days=500, cluster_unique_dates=100) == 100.0

    def test_proximity_score_bounds(self):
        # Extreme far (remote rural)
        assert compute_proximity_score(distance_to_industry=10000, industries_within_1km=0, industries_within_2km=0, ndbi=-0.5) == 0.0
        # Immediate dense industrial zone
        assert compute_proximity_score(distance_to_industry=0, industries_within_1km=15, industries_within_2km=30, ndbi=0.4) == 100.0

    def test_recurrence_score_bounds(self):
        assert compute_recurrence_score(cluster_event_count=1, daynight=1) == 15.0
        assert compute_recurrence_score(cluster_event_count=25, daynight=0) == 100.0
        assert compute_recurrence_score(cluster_event_count=100, daynight=0) == 100.0

    def test_ml_confidence_score_bounds(self):
        for cls_name in CLASS_HAZARD_WEIGHTS:
            for conf in [0.0, 0.25, 0.50, 0.85, 1.0, 1.5]:
                s = compute_ml_confidence_score(predicted_class=cls_name, confidence=conf)
                assert 0.0 <= s <= 100.0


class TestRiskLevelBoundaries:
    """Verifies standard 4-tier risk categories and boundary edge cases."""

    def test_standard_boundaries(self):
        assert get_risk_level(0.0) == "LOW"
        assert get_risk_level(24.99) == "LOW"
        assert get_risk_level(25.0) == "MODERATE"
        assert get_risk_level(49.99) == "MODERATE"
        assert get_risk_level(50.0) == "HIGH"
        assert get_risk_level(74.99) == "HIGH"
        assert get_risk_level(75.0) == "CRITICAL"
        assert get_risk_level(100.0) == "CRITICAL"

    def test_out_of_bounds_clipping(self):
        assert get_risk_level(-10.0) == "LOW"
        assert get_risk_level(150.0) == "CRITICAL"


class TestMissingValuesAndRobustness:
    """Verifies that missing keys, None, and NaN inputs evaluate safely without throwing exceptions."""

    def test_empty_event_dictionary(self):
        res = evaluate_event_risk({})
        assert isinstance(res, dict)
        assert 0.0 <= res["final_risk_score"] <= 100.0
        assert res["risk_level"] in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
        assert res["predicted_class"] == "Unknown"

    def test_nan_values_in_inputs(self):
        event_nan = {
            "event_id": "TEST_NAN",
            "frp": float("nan"),
            "bright_ti4": np.nan,
            "bright_ti5": None,
            "delta_t": np.nan,
            "distance_to_industry": np.nan,
            "industries_within_1km": None,
            "industries_within_2km": np.nan,
            "NDBI": float("nan"),
            "cluster_span_days": np.nan,
            "cluster_unique_dates": None,
            "cluster_event_count": np.nan,
            "daynight": None,
            "predicted_class": "Industrial Fire",
            "confidence": np.nan
        }
        res = evaluate_event_risk(event_nan)
        assert 0.0 <= res["final_risk_score"] <= 100.0
        assert not math.isnan(res["final_risk_score"])
        assert not math.isnan(res["thermal_score"])
        assert not math.isnan(res["industrial_proximity_score"])


class TestDeterminismAndConsistency:
    """Verifies that the engine is strictly deterministic and produces identical results across runs."""

    def test_determinism(self):
        sample_event = {
            "event_id": "FIRMS_0055",
            "frp": 18.5,
            "bright_ti4": 355.2,
            "bright_ti5": 302.1,
            "delta_t": 53.1,
            "distance_to_industry": 120.0,
            "industries_within_1km": 5,
            "industries_within_2km": 14,
            "NDBI": 0.12,
            "cluster_span_days": 45,
            "cluster_unique_dates": 12,
            "cluster_event_count": 16,
            "daynight": 0,
            "predicted_class": "Industrial Fire",
            "confidence": 0.94
        }
        res1 = evaluate_event_risk(sample_event)
        res2 = evaluate_event_risk(sample_event)
        assert res1 == res2


class TestHazardDiscrimination:
    """Verifies logical distinction between high-risk industrial hazards and low-risk rural burns."""

    def test_acute_industrial_fire_is_critical_or_high(self):
        industrial_fire = {
            "event_id": "TEST_FIRE",
            "frp": 25.0,
            "bright_ti4": 365.0,
            "bright_ti5": 300.0,
            "delta_t": 65.0,
            "distance_to_industry": 50.0,
            "industries_within_1km": 8,
            "industries_within_2km": 20,
            "NDBI": 0.22,
            "cluster_span_days": 1,
            "cluster_unique_dates": 1,
            "cluster_event_count": 1,
            "daynight": 0,
            "predicted_class": "Industrial Fire",
            "confidence": 0.98
        }
        res = evaluate_event_risk(industrial_fire)
        # Industrial fire with huge FRP in dense industrial estate should be HIGH or CRITICAL
        assert res["risk_level"] in ["HIGH", "CRITICAL"]
        assert res["final_risk_score"] >= 65.0

    def test_rural_agricultural_burn_is_low(self):
        rural_burn = {
            "event_id": "TEST_RURAL",
            "frp": 2.5,
            "bright_ti4": 320.0,
            "bright_ti5": 305.0,
            "delta_t": 15.0,
            "distance_to_industry": 6500.0,
            "industries_within_1km": 0,
            "industries_within_2km": 0,
            "NDBI": -0.15,
            "cluster_span_days": 0,
            "cluster_unique_dates": 1,
            "cluster_event_count": 1,
            "daynight": 1,
            "predicted_class": "Other Thermal Source",
            "confidence": 0.95
        }
        res = evaluate_event_risk(rural_burn)
        assert res["risk_level"] == "LOW"
        assert res["final_risk_score"] < 25.0


class TestBatchDatasetEvaluation:
    """Verifies DataFrame batch computation utility."""

    def test_batch_processing(self):
        df_sample = pd.DataFrame([
            {
                "event_id": "EVT_1",
                "frp": 3.0,
                "bright_ti4": 330.0,
                "bright_ti5": 305.0,
                "delta_t": 25.0,
                "distance_to_industry": 3500.0,
                "industries_within_1km": 0,
                "industries_within_2km": 0,
                "NDBI": -0.05,
                "cluster_span_days": 0,
                "cluster_unique_dates": 1,
                "cluster_event_count": 1,
                "daynight": 1,
                "predicted_class": "Other Thermal Source",
                "confidence": 0.92
            },
            {
                "event_id": "EVT_2",
                "frp": 12.0,
                "bright_ti4": 350.0,
                "bright_ti5": 300.0,
                "delta_t": 50.0,
                "distance_to_industry": 150.0,
                "industries_within_1km": 4,
                "industries_within_2km": 12,
                "NDBI": 0.18,
                "cluster_span_days": 70,
                "cluster_unique_dates": 15,
                "cluster_event_count": 20,
                "daynight": 0,
                "predicted_class": "Persistent Industrial Heat",
                "confidence": 0.99
            }
        ])
        results_df = compute_dataset_risk_scores(df_sample)
        assert len(results_df) == 2
        assert "final_risk_score" in results_df.columns
        assert "risk_level" in results_df.columns
        assert results_df.iloc[0]["risk_level"] == "LOW"
        assert results_df.iloc[1]["risk_level"] in ["HIGH", "CRITICAL"]


if __name__ == "__main__":
    print("Running Risk Engine unit test suite...")
    b = TestRiskEngineBounds()
    b.test_thermal_score_bounds()
    b.test_persistence_score_bounds()
    b.test_proximity_score_bounds()
    b.test_recurrence_score_bounds()
    b.test_ml_confidence_score_bounds()
    print("[PASS] TestRiskEngineBounds")

    l = TestRiskLevelBoundaries()
    l.test_standard_boundaries()
    l.test_out_of_bounds_clipping()
    print("[PASS] TestRiskLevelBoundaries")

    m = TestMissingValuesAndRobustness()
    m.test_empty_event_dictionary()
    m.test_nan_values_in_inputs()
    print("[PASS] TestMissingValuesAndRobustness")

    d = TestDeterminismAndConsistency()
    d.test_determinism()
    print("[PASS] TestDeterminismAndConsistency")

    h = TestHazardDiscrimination()
    h.test_acute_industrial_fire_is_critical_or_high()
    h.test_rural_agricultural_burn_is_low()
    print("[PASS] TestHazardDiscrimination")

    batch = TestBatchDatasetEvaluation()
    batch.test_batch_processing()
    print("[PASS] TestBatchDatasetEvaluation")

    print("\nALL 6 UNIT TEST SUITES PASSED SUCCESSFULLY (12 distinct test cases).")

