# Local Event SHAP Decision Explanations
**Project**: SIH26162 — AI-Based Detection & Classification of Industrial Fires & Persistent Thermal Sources  
**Model**: XGBoost Multiclass Baseline  

---

## Event: `FIRMS_0152` — Ground Truth: `Gas Flare` (Predicted: `Gas Flare` [66.0% confidence])
- **Physical Telemetry**: FRP = 7.03 MW, Brightness TI4 = 345.4 K, Delta T = 33.3 K, Distance = 670 m, NDVI = 0.232, NDBI = 0.006, Cluster Span = 10d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`industries_within_2km`** | 25.000 | `+1.6677` | Pushes TOWARD (+) |
| 2 | **`industries_within_1km`** | 9.000 | `+0.2406` | Pushes TOWARD (+) |
| 3 | **`distance_to_industry`** | 670.050 | `-0.0424` | Pushes AWAY (-) |
| 4 | **`frp`** | 7.030 | `+0.0000` | Pushes AWAY (-) |
| 5 | **`delta_t`** | 33.270 | `+0.0000` | Pushes AWAY (-) |

---

## Event: `FIRMS_0170` — Ground Truth: `Gas Flare` (Predicted: `Gas Flare` [94.5% confidence])
- **Physical Telemetry**: FRP = 1.51 MW, Brightness TI4 = 319.8 K, Delta T = 21.3 K, Distance = 427 m, NDVI = 0.180, NDBI = 0.135, Cluster Span = 10d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`industries_within_2km`** | 24.000 | `+1.6677` | Pushes TOWARD (+) |
| 2 | **`industries_within_1km`** | 4.000 | `+0.2406` | Pushes TOWARD (+) |
| 3 | **`distance_to_industry`** | 426.590 | `+0.0287` | Pushes TOWARD (+) |
| 4 | **`frp`** | 1.510 | `+0.0000` | Pushes AWAY (-) |
| 5 | **`delta_t`** | 21.320 | `+0.0000` | Pushes AWAY (-) |

---

## Event: `FIRMS_0120` — Ground Truth: `Industrial Fire` (Predicted: `Industrial Fire` [91.8% confidence])
- **Physical Telemetry**: FRP = 27.49 MW, Brightness TI4 = 342.2 K, Delta T = 28.6 K, Distance = 1110 m, NDVI = 0.414, NDBI = 0.128, Cluster Span = 2d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`bright_ti5`** | 313.570 | `+1.1791` | Pushes TOWARD (+) |
| 2 | **`cluster_span_days`** | 2.000 | `+0.2731` | Pushes TOWARD (+) |
| 3 | **`delta_t`** | 28.610 | `+0.1424` | Pushes TOWARD (+) |
| 4 | **`bright_ti4`** | 342.180 | `+0.1269` | Pushes TOWARD (+) |
| 5 | **`industries_within_2km`** | 5.000 | `+0.1104` | Pushes TOWARD (+) |

---

## Event: `FIRMS_0146` — Ground Truth: `Industrial Fire` (Predicted: `Industrial Fire` [96.2% confidence])
- **Physical Telemetry**: FRP = 9.26 MW, Brightness TI4 = 348.1 K, Delta T = 36.1 K, Distance = 622 m, NDVI = 0.053, NDBI = 0.072, Cluster Span = 0d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`bright_ti5`** | 312.040 | `+1.1566` | Pushes TOWARD (+) |
| 2 | **`distance_to_industry`** | 622.450 | `+0.4380` | Pushes TOWARD (+) |
| 3 | **`cluster_span_days`** | 0.000 | `+0.2871` | Pushes TOWARD (+) |
| 4 | **`delta_t`** | 36.070 | `+0.1360` | Pushes TOWARD (+) |
| 5 | **`bright_ti4`** | 348.110 | `+0.1269` | Pushes TOWARD (+) |

---

## Event: `FIRMS_0006` — Ground Truth: `Persistent Industrial Heat` (Predicted: `Persistent Industrial Heat` [96.6% confidence])
- **Physical Telemetry**: FRP = 0.97 MW, Brightness TI4 = 305.7 K, Delta T = 10.9 K, Distance = 176 m, NDVI = 0.191, NDBI = 0.083, Cluster Span = 81d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`cluster_span_days`** | 81.000 | `+1.8743` | Pushes TOWARD (+) |
| 2 | **`cluster_event_count`** | 25.000 | `+0.8391` | Pushes TOWARD (+) |
| 3 | **`cluster_unique_dates`** | 21.000 | `+0.0651` | Pushes TOWARD (+) |
| 4 | **`delta_t`** | 10.930 | `+0.0625` | Pushes TOWARD (+) |
| 5 | **`NDVI`** | 0.191 | `-0.0449` | Pushes AWAY (-) |

---

## Event: `FIRMS_0005` — Ground Truth: `Persistent Industrial Heat` (Predicted: `Persistent Industrial Heat` [97.1% confidence])
- **Physical Telemetry**: FRP = 1.77 MW, Brightness TI4 = 309.1 K, Delta T = 10.7 K, Distance = 1091 m, NDVI = 0.168, NDBI = 0.150, Cluster Span = 54d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`cluster_span_days`** | 54.000 | `+1.8743` | Pushes TOWARD (+) |
| 2 | **`cluster_event_count`** | 4.000 | `+0.8578` | Pushes TOWARD (+) |
| 3 | **`cluster_unique_dates`** | 3.000 | `+0.0651` | Pushes TOWARD (+) |
| 4 | **`delta_t`** | 10.670 | `+0.0625` | Pushes TOWARD (+) |
| 5 | **`distance_to_industry`** | 1091.390 | `+0.0293` | Pushes TOWARD (+) |

---

## Event: `FIRMS_0009` — Ground Truth: `Other Thermal Source` (Predicted: `Other Thermal Source` [97.1% confidence])
- **Physical Telemetry**: FRP = 2.35 MW, Brightness TI4 = 333.4 K, Delta T = 26.2 K, Distance = 4575 m, NDVI = 0.691, NDBI = -0.364, Cluster Span = 0d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`distance_to_industry`** | 4575.020 | `+2.1881` | Pushes TOWARD (+) |
| 2 | **`industries_within_2km`** | 0.000 | `+0.4351` | Pushes TOWARD (+) |
| 3 | **`cluster_span_days`** | 0.000 | `+0.0575` | Pushes TOWARD (+) |
| 4 | **`industries_within_1km`** | 0.000 | `+0.0304` | Pushes TOWARD (+) |
| 5 | **`NDBI`** | -0.364 | `+0.0256` | Pushes TOWARD (+) |

---

## Event: `FIRMS_0034` — Ground Truth: `Other Thermal Source` (Predicted: `Other Thermal Source` [96.8% confidence])
- **Physical Telemetry**: FRP = 2.50 MW, Brightness TI4 = 340.4 K, Delta T = 44.0 K, Distance = 4012 m, NDVI = 0.874, NDBI = -0.392, Cluster Span = 0d

| Rank | Feature | Feature Value | SHAP Contribution | Influence Direction |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **`distance_to_industry`** | 4011.530 | `+2.1881` | Pushes TOWARD (+) |
| 2 | **`industries_within_2km`** | 0.000 | `+0.4351` | Pushes TOWARD (+) |
| 3 | **`cluster_span_days`** | 0.000 | `+0.0575` | Pushes TOWARD (+) |
| 4 | **`industries_within_1km`** | 0.000 | `+0.0304` | Pushes TOWARD (+) |
| 5 | **`NDBI`** | -0.392 | `+0.0256` | Pushes TOWARD (+) |

---
