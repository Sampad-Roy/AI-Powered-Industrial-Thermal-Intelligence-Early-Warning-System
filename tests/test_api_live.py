"""Live endpoint smoke test — tests the running server on localhost:8000."""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import json

import httpx

BASE = "http://localhost:8000"

def test_live():
    # /health
    r = httpx.get(f"{BASE}/health")
    print("=== GET /health ===")
    print(json.dumps(r.json(), indent=2))
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

    # /predict — industrial scenario
    payload = {
        "event_id": "FIRMS_0055",
        "bright_ti4": 355.2, "bright_ti5": 302.1, "frp": 18.5,
        "daynight": 0, "distance_to_industry": 120.0,
        "industries_within_1km": 5, "industries_within_2km": 14,
        "NDBI": 0.22, "cluster_event_count": 16,
        "cluster_unique_dates": 12, "cluster_span_days": 45
    }
    r2 = httpx.post(f"{BASE}/predict", json=payload)
    print("\n=== POST /predict ===")
    print(json.dumps(r2.json(), indent=2))
    assert r2.status_code == 200
    body = r2.json()
    assert body["risk_level"] in ("MODERATE","HIGH","CRITICAL")
    print(f"\n[OK] predicted_class  = {body['predicted_class']}")
    print(f"[OK] confidence       = {body['confidence']:.4f}")
    print(f"[OK] final_risk_score = {body['final_risk_score']}")
    print(f"[OK] risk_level       = {body['risk_level']}")
    print(f"[OK] shap top-1 feat  = {body['top_shap_explanations'][0]['feature']}")
    print("\nLIVE SMOKE TEST PASSED.")

if __name__ == "__main__":
    test_live()
