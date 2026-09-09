import urllib.request
import json

presets = [
    {
        'name': 'Sanand Flare Stack Candidate',
        'data': {
            'event_id': 'PRESET_FLARE_01',
            'bright_ti4': 352.4,
            'bright_ti5': 301.2,
            'frp': 9.8,
            'delta_t': 51.2,
            'daynight': 0,
            'distance_to_industry': 420.0,
            'industries_within_500m': 1,
            'industries_within_1km': 4,
            'industries_within_2km': 11,
            'NDVI': 0.14,
            'NDBI': 0.18,
            'NDWI': -0.28,
            'cluster_event_count': 8,
            'cluster_unique_dates': 7,
            'cluster_span_days': 34,
        }
    },
    {
        'name': 'Vatva Industrial Fire Outbreak',
        'data': {
            'event_id': 'PRESET_FIRE_EMERGENCY',
            'bright_ti4': 368.5,
            'bright_ti5': 300.5,
            'frp': 24.5,
            'delta_t': 68.0,
            'daynight': 0,
            'distance_to_industry': 45.0,
            'industries_within_500m': 5,
            'industries_within_1km': 12,
            'industries_within_2km': 26,
            'NDVI': 0.08,
            'NDBI': 0.28,
            'NDWI': -0.35,
            'cluster_event_count': 2,
            'cluster_unique_dates': 1,
            'cluster_span_days': 0,
        }
    }
]

print("1. Testing Health check via Vite proxy (http://localhost:5173/health)...")
res_h = urllib.request.urlopen('http://localhost:5173/health')
print(f"   Status: {res_h.status}, Body: {res_h.read().decode()}")

print("\n2. Testing Events catalog via Vite proxy (http://localhost:5173/events)...")
res_e = urllib.request.urlopen('http://localhost:5173/events')
events = json.loads(res_e.read().decode())
print(f"   Status: {res_e.status}, Event count: {len(events)}")

print("\n3. Testing Presets via Vite proxy (http://localhost:5173/predict)...")
for p in presets:
    req = urllib.request.Request(
        'http://localhost:5173/predict',
        data=json.dumps(p['data']).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    out = json.loads(res.read().decode())
    print(f"\n   === {p['name']} ===")
    print(f"   Status: {res.status}")
    print(f"   Predicted Class: {out['predicted_class']}")
    print(f"   Confidence: {out['confidence']}")
    print(f"   Class Probabilities: {out['class_probabilities']}")
    print(f"   Risk Score: {out['final_risk_score']}")
    print(f"   Risk Level: {out['risk_level']}")
    print(f"   Risk Factors: {out['top_risk_factors']}")
    print(f"   SHAP count: {len(out['top_shap_explanations'])}")
    for shap in out['top_shap_explanations']:
        print(f"     - {shap['feature']}: {shap['shap_value']} ({shap['direction']})")

print("\nALL INFERENCE PIPELINE CHECKS PASSED.")
