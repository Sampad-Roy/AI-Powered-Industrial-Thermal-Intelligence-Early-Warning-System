# SIH26162 — Thermal Anomaly Classification & Risk API
## API Documentation v1.0.0

> **Project**: SIH26162 — AI-Based Detection & Classification of Industrial Fires, Persistent Thermal Sources, Gas Flares, and Agricultural Burns from NASA VIIRS Satellite Data.

---

## Quick Start

### Start the Server
```bash
# From the project root (SIH 26/)
python api_server.py
```

Server listens on `http://0.0.0.0:8000`

| Interface | URL |
|---|---|
| Interactive Swagger UI | http://localhost:8000/docs |
| ReDoc UI | http://localhost:8000/redoc |
| Health Check | http://localhost:8000/health |
| Predict Endpoint | http://localhost:8000/predict |

---

## Endpoints

### `GET /health`

Liveness and model readiness probe. Call this before any inference to confirm the server is operational.

#### Response — `200 OK`
```json
{
  "status": "ok",
  "model_loaded": true,
  "classes": [
    "Gas Flare",
    "Industrial Fire",
    "Other Thermal Source",
    "Persistent Industrial Heat"
  ],
  "num_features": 15,
  "version": "1.0.0"
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `"ok"` \| `"degraded"` | `"degraded"` if model failed to load at startup |
| `model_loaded` | `bool` | `true` when XGBoost model is in memory |
| `classes` | `string[]` | Four classification target classes (label-encoded order) |
| `num_features` | `int` | Expected number of input features (`15`) |
| `version` | `string` | API semantic version |

#### `curl` Example
```bash
curl http://localhost:8000/health
```

---

### `POST /predict`

Accepts one satellite thermal event's feature values and returns:
- Predicted class + confidence
- Full class probability distribution
- 5 interpretable risk sub-scores + composite Risk Score (0–100)
- Risk Level (LOW / MODERATE / HIGH / CRITICAL)
- Top-5 SHAP feature explanations for the predicted class

#### Request Body — `application/json`

```json
{
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
  "cluster_span_days": 45
}
```

#### Request Fields

| Field | Type | Required | Default | Range / Values | Description |
|---|---|:---:|---|---|---|
| `event_id` | `string` | No | `null` | Any string | Optional identifier echoed in the response |
| `bright_ti4` | `float` | **Yes** | — | 200–500 K | VIIRS I-Band 4 (Mid-Wave IR) brightness temperature in Kelvin |
| `bright_ti5` | `float` | **Yes** | — | 200–400 K | VIIRS I-Band 5 (Long-Wave IR) brightness temperature in Kelvin |
| `frp` | `float` | **Yes** | — | ≥ 0.0 MW | Fire Radiative Power in megawatts |
| `delta_t` | `float` | No | *auto-computed* | ≥ 0.0 K | `bright_ti4 − bright_ti5`. Auto-derived if omitted. |
| `daynight` | `0` or `1` | No | `1` | `0` = night, `1` = day | Satellite overpass time flag |
| `distance_to_industry` | `float` | No | `5000.0` | ≥ 0.0 m | Distance to nearest industrial boundary in metres |
| `industries_within_500m` | `int` | No | `0` | ≥ 0 | Registered industrial facilities within 500 m |
| `industries_within_1km` | `int` | No | `0` | ≥ 0 | Registered industrial facilities within 1 km |
| `industries_within_2km` | `int` | No | `0` | ≥ 0 | Registered industrial facilities within 2 km |
| `NDVI` | `float` | No | `0.3` | −1.0 to 1.0 | Normalised Difference Vegetation Index (Sentinel-2) |
| `NDBI` | `float` | No | `0.0` | −1.0 to 1.0 | Normalised Difference Built-up Index (Sentinel-2) |
| `NDWI` | `float` | No | `0.0` | −1.0 to 1.0 | Normalised Difference Water Index (Sentinel-2) |
| `cluster_event_count` | `int` | No | `1` | ≥ 1 | Total detections in the spatial cluster |
| `cluster_unique_dates` | `int` | No | `1` | ≥ 1 | Unique observation dates in the cluster |
| `cluster_span_days` | `int` | No | `0` | ≥ 0 | Days between first and last cluster detection |

#### Response — `200 OK`

```json
{
  "event_id": "FIRMS_0055",
  "predicted_class": "Persistent Industrial Heat",
  "confidence": 0.970901,
  "class_probabilities": {
    "Gas Flare": 0.000182,
    "Industrial Fire": 0.000419,
    "Other Thermal Source": 0.028498,
    "Persistent Industrial Heat": 0.970901
  },
  "thermal_score": 42.31,
  "persistence_score": 63.75,
  "industrial_proximity_score": 68.40,
  "recurrence_score": 74.17,
  "ml_confidence_score": 63.11,
  "final_risk_score": 61.88,
  "risk_level": "HIGH",
  "top_risk_factors": "Chronic Operational Heat Source (45d persistence); Immediate Industrial Co-location (120m); Dense Industrial Cluster (14 facilities within 2km)",
  "top_shap_explanations": [
    {
      "feature": "cluster_span_days",
      "feature_value": 45.0,
      "shap_value": 1.2843,
      "direction": "pushes TOWARD predicted class"
    },
    {
      "feature": "distance_to_industry",
      "feature_value": 120.0,
      "shap_value": 0.9127,
      "direction": "pushes TOWARD predicted class"
    },
    {
      "feature": "industries_within_2km",
      "feature_value": 14.0,
      "shap_value": 0.7451,
      "direction": "pushes TOWARD predicted class"
    },
    {
      "feature": "cluster_event_count",
      "feature_value": 16.0,
      "shap_value": 0.5983,
      "direction": "pushes TOWARD predicted class"
    },
    {
      "feature": "NDBI",
      "feature_value": 0.22,
      "shap_value": 0.3217,
      "direction": "pushes TOWARD predicted class"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|---|---|---|
| `event_id` | `string \| null` | Echoed from request |
| `predicted_class` | `string` | One of the four target classes |
| `confidence` | `float` | Model probability for predicted class (0.0–1.0) |
| `class_probabilities` | `object` | Full probability distribution across all 4 classes |
| `thermal_score` | `float` | Thermal Severity sub-score (0–100) |
| `persistence_score` | `float` | Temporal Persistence sub-score (0–100) |
| `industrial_proximity_score` | `float` | Industrial Proximity sub-score (0–100) |
| `recurrence_score` | `float` | Recurrence Pattern sub-score (0–100) |
| `ml_confidence_score` | `float` | ML Hazard Multiplier sub-score (0–100) |
| `final_risk_score` | `float` | Composite weighted Risk Score (0–100) |
| `risk_level` | `"LOW"` \| `"MODERATE"` \| `"HIGH"` \| `"CRITICAL"` | Risk tier |
| `top_risk_factors` | `string` | Human-readable top 1–3 driving factors |
| `top_shap_explanations` | `object[]` | Top-5 SHAP feature contributions (see below) |

#### SHAP Contribution Object

| Field | Type | Description |
|---|---|---|
| `feature` | `string` | Feature name |
| `feature_value` | `float` | Input value for this feature |
| `shap_value` | `float` | SHAP contribution in log-odds units |
| `direction` | `string` | `"pushes TOWARD predicted class"` or `"pushes AWAY from predicted class"` |

---

## Error Responses

### `422 Unprocessable Entity` — Input Validation Error
Returned when a required field is missing or a value violates constraints (e.g. negative FRP, `bright_ti4` out of range).

```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "frp"],
      "msg": "Value error, frp must be ≥ 0 (Fire Radiative Power cannot be negative).",
      "input": -5.0
    }
  ]
}
```

### `503 Service Unavailable` — Model Not Loaded
Returned when the model bundle failed to initialise at startup.

```json
{
  "detail": "Model bundle not available: Required model artifact not found: ..."
}
```

### `500 Internal Server Error`
```json
{
  "error": "ExceptionType",
  "detail": "Human-readable description of what went wrong."
}
```

---

## `curl` Examples

### Minimal Payload (3 required fields only)
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"bright_ti4": 340.0, "bright_ti5": 305.0, "frp": 5.0}'
```

### Full Industrial Scenario
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "FIRMS_0055",
    "bright_ti4": 355.2,
    "bright_ti5": 302.1,
    "frp": 18.5,
    "daynight": 0,
    "distance_to_industry": 120.0,
    "industries_within_1km": 5,
    "industries_within_2km": 14,
    "NDBI": 0.22,
    "cluster_event_count": 16,
    "cluster_unique_dates": 12,
    "cluster_span_days": 45
  }'
```

### Agricultural Burn (minimal risk)
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "FIRMS_0001",
    "bright_ti4": 322.0,
    "bright_ti5": 307.0,
    "frp": 2.8,
    "daynight": 1,
    "distance_to_industry": 6200.0,
    "NDVI": 0.48,
    "cluster_span_days": 0
  }'
```

---

## Risk Score Formula (Summary)

$$\text{Final Risk Score} = 0.25 \cdot S_{\text{thermal}} + 0.25 \cdot S_{\text{proximity}} + 0.25 \cdot S_{\text{ml}} + 0.15 \cdot S_{\text{persistence}} + 0.10 \cdot S_{\text{recurrence}}$$

| Risk Level | Score Range | Operational Meaning |
|:---:|:---:|---|
| **LOW** | 0 – 24 | Routine rural/agricultural burn |
| **MODERATE** | 25 – 49 | Watch-list — automated monitoring |
| **HIGH** | 50 – 74 | Priority industrial inspection |
| **CRITICAL** | 75 – 100 | Emergency dispatch / containment |

Full formula specification: [`data/reports/RISK_METHODOLOGY.md`](./RISK_METHODOLOGY.md)

---

## Classification Target Classes

| Class | Hazard Weight | Description |
|---|:---:|---|
| `Industrial Fire` | 1.00 | Acute uncontrolled fire in industrial premises |
| `Gas Flare` | 0.85 | Continuous high-temperature flare stack combustion |
| `Persistent Industrial Heat` | 0.65 | Chronic furnace / kiln / operational thermal emission |
| `Other Thermal Source` | 0.25 | Agricultural crop burn / open-field clearing |

---

## Architecture Notes

- **Model**: XGBoost multiclass (`data/models/xgboost_model.pkl`), loaded **once** at server startup.
- **Explainability**: SHAP `TreeExplainer` computes per-request local attributions for the predicted class.
- **Risk Engine**: Reuses `src/risk/risk_engine.py` — no code duplication.
- **Validation**: Pydantic v2 schemas in `src/api/schemas.py`.
- **No ground-truth labels** are used at inference time. All scoring is based purely on satellite features and model predictions.
