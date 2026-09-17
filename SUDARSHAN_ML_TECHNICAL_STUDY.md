# SUDARSHAN — SIH26162 ML Technical Study

**Project**: AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Problem Statement ID**: SIH26162  
**Team**: SUDARSHAN  
**Study Area**: Ahmedabad, Gujarat, India (Bounding Box: 72.25°E – 72.85°E, 22.75°N – 23.25°N)  
**Observation Period**: March 1, 2026 – May 31, 2026  
**Document Purpose**: Complete technical explanation of the existing implementation for SIH viva preparation  

---

## Table of Contents

1. [Complete System Architecture](#1-complete-system-architecture)  
2. [End-to-End Data Flow](#2-end-to-end-data-flow)  
3. [NASA FIRMS Data & Preprocessing](#3-nasa-firms-data--preprocessing)  
4. [DBSCAN / Spatial Clustering](#4-dbscan--spatial-clustering)  
5. [All ML Features / Parameters](#5-all-ml-features--parameters)  
6. [Feature Engineering](#6-feature-engineering)  
7. [XGBoost Model](#7-xgboost-model)  
8. [Dataset & Ground-Truth Labeling](#8-dataset--ground-truth-labeling)  
9. [Model Evaluation Metrics](#9-model-evaluation-metrics)  
10. [SHAP / XAI — Explainability](#10-shap--xai--explainability)  
11. [Risk Engine](#11-risk-engine)  
12. [Walkthrough: One Thermal Event — Raw Data → Final Risk](#12-walkthrough-one-thermal-event--raw-data--final-risk)  
13. [Important Technical Terms](#13-important-technical-terms)  
14. [Possible SIH Judge / Viva Questions with Answers](#14-possible-sih-judge--viva-questions-with-answers)  

---

## 1. Complete System Architecture

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Satellite Data Source | NASA FIRMS API (VIIRS NOAA-20 SP) | Raw thermal hotspot detections |
| Geospatial Context | OpenStreetMap (Overpass API) | Industrial facility locations |
| Satellite Imagery | Google Earth Engine (Copernicus Sentinel-2 SR Harmonized) | Spectral index extraction (NDVI, NDBI, NDWI) |
| ML Framework | XGBoost (`xgb.XGBClassifier`) | Multiclass classification |
| Explainability | SHAP (`shap.TreeExplainer`) | Feature attribution / model transparency |
| Risk Engine | Custom Python (`src/risk/risk_engine.py`) | 5-factor weighted risk scoring (0–100) |
| Backend API | FastAPI + Uvicorn | RESTful inference & catalog endpoints |
| Frontend | React + Vite + Tailwind CSS | Command-center dashboard UI |
| Serialization | Joblib (`.pkl`), JSON | Model & artifact persistence |
| Coordinate System | WGS84 (EPSG:4326) + UTM Zone 43N (EPSG:32643) | Geographic & metric projections |

### 1.2 Directory Structure (Key Files)

```
├── api_server.py                        # Uvicorn entry point
├── run_pipeline.py                      # CLI pipeline runner (Phase 1)
├── configs/config.py                    # Global paths & constants
├── scripts/
│   ├── 01_download_firms.py             # Live FIRMS download (5-day test)
│   ├── 02_download_firms_history.py     # Historical 3-month download
│   ├── 03_download_osm_industrial.py    # OSM industrial facilities
│   ├── 04_spatial_match.py              # FIRMS ↔ OSM nearest-join + density
│   ├── 05_persistence_analysis.py       # Grid-based temporal persistence
│   ├── 06_satellite_features.py         # GEE Sentinel-2 NDVI/NDBI/NDWI
│   ├── 07_prepare_ai_dataset.py         # Final feature table assembly
│   ├── generate_cluster_analysis.py     # 500m-radius spatial clustering
│   ├── train_xgboost.py                 # Model training + evaluation
│   └── explain_xgboost_shap.py          # SHAP global + local explanations
├── src/
│   ├── api/
│   │   ├── app.py                       # FastAPI app (/health, /predict, /events)
│   │   ├── model_loader.py              # Singleton ModelBundle cache
│   │   └── schemas.py                   # Pydantic request/response models
│   ├── data/
│   │   ├── pipeline.py                  # Phase 1 data pipeline
│   │   ├── firms_cleaner.py             # Cleaning & deduplication
│   │   ├── firms_validator.py           # Coordinate & range validation
│   │   └── firms_eda.py                 # Exploratory data analysis
│   └── risk/
│       └── risk_engine.py               # 5-component risk scoring
├── data/
│   ├── models/
│   │   ├── xgboost_model.pkl            # Trained XGBoost (309 KB)
│   │   ├── label_encoder.pkl            # sklearn LabelEncoder (4 classes)
│   │   └── feature_schema.json          # 15 feature names + dtypes
│   ├── processed/
│   │   ├── AI_READY_DATASET.csv         # Final 58-event labeled dataset
│   │   └── model_features.csv           # Feature matrix for training
│   └── reports/
│       ├── xgboost_metrics.json         # Full evaluation metrics
│       ├── shap_feature_importance.csv  # SHAP values per class
│       └── risk_scores.csv              # Risk scores for all events
└── frontend/                            # React/Vite SPA
```

### 1.3 High-Level Architecture Diagram

```
  NASA FIRMS API                     OpenStreetMap                  Google Earth Engine
  (VIIRS NOAA-20)                    (Overpass API)                 (Sentinel-2 SR)
       │                                  │                              │
       ▼                                  ▼                              │
  [01] Download          [03] Download Industrial                        │
  Raw Hotspots           Facility Polygons                               │
       │                                  │                              │
       ▼                                  ▼                              │
  [02] Historical        ┌────────────────┘                              │
  Data Merge             │                                               │
       │                 │                                               │
       ▼                 ▼                                               ▼
  [04] Spatial Match  ←──┘                                     [06] Spectral Indices
  (sjoin_nearest +                                             (NDVI, NDBI, NDWI)
   buffer density)                                                       │
       │                                                                 │
       ▼                                                                 ▼
  [05] Persistence                                             [07] Prepare AI Dataset
  Analysis (Grid)                                              (Feature Assembly)
       │                                                                 │
       └─────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Spatial Clustering   │
                              │  (500m connectivity)  │
                              │  + Human Labeling     │
                              └──────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   XGBoost Training    │
                              │   (58 samples,        │
                              │    15 features,       │
                              │    4 classes)          │
                              └──────────────────────┘
                                         │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    SHAP / XAI     Risk Engine     FastAPI
                    (TreeExplainer)  (5-factor)     (/predict,
                                     (0–100)        /events)
                                                       │
                                                       ▼
                                                 React Frontend
                                                 (Dashboard)
```

---

## 2. End-to-End Data Flow

The pipeline has **7 numbered preprocessing scripts** executed sequentially, followed by clustering, labeling, training, and explainability stages.

| Stage | Script | Input | Output | Purpose |
|---|---|---|---|---|
| 1 | `01_download_firms.py` | NASA FIRMS API | `data/firms/firms_raw_noaa20_sp_5day.csv` | Download 5-day live test data |
| 2 | `02_download_firms_history.py` | NASA FIRMS API | `data/firms/firms_raw.csv` | Download 3-month historical data (Mar–May 2026) in 5-day chunks |
| 3 | `03_download_osm_industrial.py` | Overpass API | `data/osm/industrial_facilities.geojson` | Download all industrial facilities in Ahmedabad bbox |
| 4 | `04_spatial_match.py` | `firms_raw.csv` + `industrial_facilities.geojson` | `outputs/firms_osm_spatial_features.csv` | Nearest-industry join + density counts (500m/1km/2km) |
| 5 | `05_persistence_analysis.py` | `firms_osm_spatial_features.csv` | `outputs/persistent_sources.csv` | Grid-based temporal persistence classification |
| 6 | `06_satellite_features.py` | `firms_osm_spatial_features.csv` + GEE | `outputs/ai_features_final.csv` | Extract NDVI, NDBI, NDWI from Sentinel-2 |
| 7 | `07_prepare_ai_dataset.py` | `ai_features_final.csv` | `outputs/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv` | Assemble 13-feature AI-ready table |
| 8 | `generate_cluster_analysis.py` | `label_validation_table.csv` | `CLUSTER_LABEL_ANALYSIS.md` | 500m spatial clustering → candidate categories |
| 9 | `train_xgboost.py` | `data/processed/model_features.csv` | `data/models/xgboost_model.pkl` + metrics | Train & evaluate XGBoost |
| 10 | `explain_xgboost_shap.py` | `model_features.csv` + `xgboost_model.pkl` | SHAP plots + `XAI_AUDIT.md` | Global & local SHAP explanations |
| 11 | `generate_risk_reports.py` | Dataset + model predictions | `risk_scores.csv` | Risk scores for all 58 events |

---

## 3. NASA FIRMS Data & Preprocessing

### 3.1 What is NASA FIRMS?

**FIRMS** = **Fire Information for Resource Management System**, operated by NASA's LANCE (Land, Atmosphere Near Real-Time Capability for EOS).

FIRMS processes satellite-borne thermal infrared sensor data to detect active fires and thermal anomalies globally. Our project uses the **VIIRS** (Visible Infrared Imaging Radiometer Suite) instrument on the **NOAA-20 (JPSS-1)** satellite, specifically the **Standard Processing (SP)** science-quality product.

### 3.2 Data Acquisition

**File**: [`scripts/01_download_firms.py`](scripts/01_download_firms.py) and [`scripts/02_download_firms_history.py`](scripts/02_download_firms_history.py)

| Parameter | Value |
|---|---|
| API Endpoint | `https://firms.modaps.eosdis.nasa.gov/api/area/csv/` |
| Product | `VIIRS_NOAA20_SP` (Standard Processing) |
| Bounding Box | `72.25,22.75,72.85,23.25` (Ahmedabad) |
| Date Range | March 1, 2026 – May 31, 2026 |
| Chunk Size | 5 days per API request (API maximum) |
| Authentication | NASA FIRMS `MAP_KEY` (environment variable) |
| Total Raw Records | **202 thermal detections** |

**Download Process** (Script `02`):
1. Iterates from `START_DATE` to `END_DATE` in 5-day windows
2. Each window → one HTTP GET request to FIRMS API
3. All chunks concatenated into one DataFrame
4. Duplicates removed with `drop_duplicates()`
5. Sorted by `acq_date` and `acq_time`
6. Saved to `data/firms/firms_raw.csv`

### 3.3 Raw FIRMS Columns Used

| Column | Description | Unit |
|---|---|---|
| `latitude` | Hotspot center latitude | Decimal degrees (WGS84) |
| `longitude` | Hotspot center longitude | Decimal degrees (WGS84) |
| `bright_ti4` | Brightness temperature, VIIRS I4 band (3.74 µm) | Kelvin |
| `bright_ti5` | Brightness temperature, VIIRS I5 band (11.45 µm) | Kelvin |
| `frp` | Fire Radiative Power | Megawatts (MW) |
| `confidence` | Detection confidence | Categorical ("l", "n", "h") |
| `scan` | Along-scan pixel size | Kilometers |
| `track` | Along-track pixel size | Kilometers |
| `acq_date` | Acquisition date | YYYY-MM-DD |
| `acq_time` | Acquisition time (UTC) | HHMM |
| `satellite` | Satellite name | String ("N20") |
| `instrument` | Sensor name | String ("VIIRS") |
| `daynight` | Day or night overpass | "D" or "N" |

### 3.4 Phase 1 Data Pipeline (Cleaning)

**Files**: [`src/data/pipeline.py`](src/data/pipeline.py), [`src/data/firms_cleaner.py`](src/data/firms_cleaner.py), [`src/data/firms_validator.py`](src/data/firms_validator.py)

The Phase 1 pipeline (invoked via `run_pipeline.py`) performs:

1. **Loading**: Read raw CSV with pandas
2. **Validation**: Check required columns exist (`latitude`, `longitude`, `acq_date`, `acq_time`); validate coordinate bounds (−90 to +90 lat, −180 to +180 lon); check `bright_*` ≥ 0 K and `frp` ≥ 0 MW
3. **Cleaning**: Remove rows with null coordinates; coerce numeric fields; strip whitespace
4. **Deduplication**: Remove identical rows on the key set `[latitude, longitude, acq_date, acq_time]`
5. **EDA Report**: Generate `firms_eda_report.json` with statistical summaries

---

## 4. DBSCAN / Spatial Clustering

### 4.1 What is Spatial Clustering and Why?

Individual FIRMS hotspot detections are point-level records. A single real-world fire or thermal source often triggers **multiple satellite detections** across different dates or even multiple pixels in a single overpass. Spatial clustering groups these detections into coherent "events" or "sources."

### 4.2 Implementation

**File**: [`scripts/generate_cluster_analysis.py`](scripts/generate_cluster_analysis.py) (Lines 173, 303)

The project uses a **500-meter spatial connectivity radius** to group the 202 raw thermal detections into **136 distinct spatial clusters**:

- **Multi-Event Clusters (N ≥ 2)**: 34 clusters encompassing 100 events
- **Single-Event Clusters (N = 1)**: 102 isolated/singleton events

### 4.3 Grid-Based Persistence Grouping (Alternative Method)

**File**: [`scripts/05_persistence_analysis.py`](scripts/05_persistence_analysis.py)

In addition to DBSCAN-style clustering, the project also implements a **grid-based persistence analysis**:

| Parameter | Value | Rationale |
|---|---|---|
| `GRID_SIZE` | 0.01° (~1 km) | Groups nearby detections into spatial cells |
| `MIN_DETECTION_DAYS` | 3 | Minimum unique detection dates for "Persistent" classification |

**Process**:
1. Assign each detection to a grid cell: `grid_lat = floor(lat / 0.01) * 0.01`
2. Group by `(grid_lat, grid_lon)`
3. Compute per-cell aggregates: `first_detection`, `last_detection`, `total_detections`, `detection_days`, `average_frp`, `maximum_frp`
4. Calculate `observation_period_days` = `last - first + 1`
5. Calculate `detection_frequency` = `detection_days / observation_period_days`
6. Classify: if `detection_days ≥ 3` → **"Persistent"**, else **"Non-Persistent"**

### 4.4 Cluster-Level Features (Used in Model)

Three cluster-level features are computed and added to each event record:

| Feature | Meaning | How Computed |
|---|---|---|
| `cluster_event_count` | Total FIRMS detections in this cluster | `count()` per cluster |
| `cluster_unique_dates` | Number of distinct acquisition dates | `nunique('acq_date')` per cluster |
| `cluster_span_days` | Days between first and last detection | `(max_date - min_date).days` |

---

## 5. All ML Features / Parameters

### 5.1 Complete Feature Table (15 Features)

The XGBoost model uses exactly **15 features**, defined in [`data/models/feature_schema.json`](data/models/feature_schema.json):

| # | Feature Name | Type | Source | Physical Meaning | Unit |
|---|---|---|---|---|---|
| 1 | `bright_ti4` | float64 | NASA FIRMS | Brightness temperature at 3.74 µm (I4 band) — peak sensitivity to active combustion | Kelvin (K) |
| 2 | `bright_ti5` | float64 | NASA FIRMS | Brightness temperature at 11.45 µm (I5 band) — background thermal state | Kelvin (K) |
| 3 | `frp` | float64 | NASA FIRMS | Fire Radiative Power — total thermal energy emitted per unit time | Megawatts (MW) |
| 4 | `delta_t` | float64 | Computed | `bright_ti4 − bright_ti5` — sub-pixel combustion thermal contrast | Kelvin (K) |
| 5 | `daynight` | int64 | NASA FIRMS | Satellite overpass time: `1` = Day, `0` = Night | Binary |
| 6 | `distance_to_industry` | float64 | OSM + GeoPandas | Distance from hotspot to nearest industrial facility (OSM) | Meters (m) |
| 7 | `industries_within_500m` | int64 | OSM + GeoPandas | Count of industrial facilities within 500m radius | Count |
| 8 | `industries_within_1km` | int64 | OSM + GeoPandas | Count of industrial facilities within 1 km radius | Count |
| 9 | `industries_within_2km` | int64 | OSM + GeoPandas | Count of industrial facilities within 2 km radius | Count |
| 10 | `NDVI` | float64 | Sentinel-2 via GEE | Normalized Difference Vegetation Index — vegetation density | −1 to +1 (dimensionless) |
| 11 | `NDBI` | float64 | Sentinel-2 via GEE | Normalized Difference Built-up Index — impervious surface density | −1 to +1 (dimensionless) |
| 12 | `NDWI` | float64 | Sentinel-2 via GEE | Normalized Difference Water Index — water body presence | −1 to +1 (dimensionless) |
| 13 | `cluster_event_count` | int64 | Spatial Clustering | Total detections within this spatial cluster | Count |
| 14 | `cluster_unique_dates` | int64 | Spatial Clustering | Distinct satellite overpass dates for this cluster | Count |
| 15 | `cluster_span_days` | int64 | Spatial Clustering | Temporal window span of this cluster | Days |

### 5.2 Feature Groups

The 15 features fall into **4 logical groups**:

| Group | Features | Source Sensor/System |
|---|---|---|
| **Thermal / Radiometric** (6) | `bright_ti4`, `bright_ti5`, `frp`, `delta_t`, `daynight`, `confidence`* | VIIRS on NOAA-20 |
| **Industrial Proximity** (4) | `distance_to_industry`, `industries_within_500m`, `industries_within_1km`, `industries_within_2km` | OpenStreetMap via Overpass API |
| **Spectral Indices** (3) | `NDVI`, `NDBI`, `NDWI` | Sentinel-2 via Google Earth Engine |
| **Temporal / Clustering** (3) | `cluster_event_count`, `cluster_unique_dates`, `cluster_span_days` | Derived from DBSCAN clustering |

*Note: `confidence` from FIRMS is used in the initial 13-feature handoff but is **not** in the final 15-feature training set. `delta_t` and cluster features are added during feature engineering.*

---

## 6. Feature Engineering

### 6.1 `delta_t` — Sub-Pixel Thermal Contrast

**Why**: The difference between TI4 (3.74 µm, fire-sensitive) and TI5 (11.45 µm, background) isolates the thermal signature of actual combustion from ambient surface temperature.

```
delta_t = bright_ti4 − bright_ti5
```

- **High ΔT (> 30 K)**: Strong sub-pixel combustion → likely fire or flare
- **Low ΔT (< 10 K)**: Diffuse heat → likely persistent industrial process

### 6.2 Spatial Proximity Features

**File**: [`scripts/04_spatial_match.py`](scripts/04_spatial_match.py)

1. **Nearest Industry Distance**: Uses `gpd.sjoin_nearest()` in metric CRS (EPSG:32643, UTM Zone 43N) to find the closest OSM industrial polygon centroid for each FIRMS point.
2. **Density Counts**: For each FIRMS point, a 2 km buffer is created. Using a spatial index (`sindex`), all OSM facilities intersecting this buffer are identified, then filtered to exact distances of 500m, 1 km, and 2 km.

### 6.3 Sentinel-2 Spectral Indices

**File**: [`scripts/06_satellite_features.py`](scripts/06_satellite_features.py)

For each FIRMS detection, the nearest cloud-free Sentinel-2 image (±15 days) is retrieved from Google Earth Engine:

| Index | Formula | Sentinel-2 Bands | Physical Meaning |
|---|---|---|---|
| **NDVI** | `(B8 − B4) / (B8 + B4)` | B8 = NIR (842 nm), B4 = Red (665 nm) | Vegetation density. High → green vegetation; Low/negative → bare soil, built-up, or water |
| **NDBI** | `(B11 − B8) / (B11 + B8)` | B11 = SWIR (1610 nm), B8 = NIR (842 nm) | Built-up / impervious surface density. Positive → concrete, industrial zones |
| **NDWI** | `(B3 − B8) / (B3 + B8)` | B3 = Green (560 nm), B8 = NIR (842 nm) | Water presence. Positive → water bodies |

**Cloud Masking** (function `mask_sentinel2`):
- Uses Sentinel-2 Scene Classification Layer (SCL)
- Masks pixels classified as: Cloud Shadow (3), Cloud Medium (8), Cloud High (9), Cirrus (10), Snow/Ice (11)

**Why These Indices Matter for Classification**:
- **NDVI > 0.25 + NDBI < 0** → Rural/agricultural area → likely "Other Thermal Source" (crop burn)
- **NDBI > 0.10 + NDVI < 0.20** → Industrial/built-up zone → likely industrial-origin thermal event
- **NDWI** serves as a control: high NDWI near a hotspot may indicate a cooling pond or waterbody

### 6.4 Day/Night Encoding

**File**: [`scripts/07_prepare_ai_dataset.py`](scripts/07_prepare_ai_dataset.py) (Lines 97–108)

The FIRMS `daynight` field ("D"/"N") is converted to a binary integer: `D → 1`, `N → 0`. Nighttime detections are significant because persistent industrial heat sources (factories, flares) are more reliably detectable at night without solar contamination.

---

## 7. XGBoost Model

### 7.1 Why XGBoost?

**File**: [`scripts/train_xgboost.py`](scripts/train_xgboost.py)

XGBoost (eXtreme Gradient Boosting) was chosen over Random Forest as the production baseline because:

1. **Superior Generalization**: XGBoost achieved CV Weighted F1 of **96.5%** vs Random Forest's **90.5%** — a +6% improvement
2. **Regularization**: Built-in L1/L2 regularization + constrained `max_depth` prevents overfitting on our small dataset (N=58)
3. **Gradient Boosting**: Sequentially corrects residual errors, better handling of class imbalance
4. **Feature Interaction**: Learns complex feature interactions (e.g., distance × cluster_span) that a single RF tree cannot exploit
5. **SHAP Compatibility**: `shap.TreeExplainer` natively supports XGBoost's Booster structure for exact Shapley values

### 7.2 Hyperparameters

All hyperparameters are defined in [`scripts/train_xgboost.py`](scripts/train_xgboost.py) (Lines 68–79):

| Hyperparameter | Value | Rationale |
|---|---|---|
| `n_estimators` | 100 | Number of boosting rounds |
| `max_depth` | 3 | **Constrained ≤ 4** to prevent overfitting on N=58 |
| `learning_rate` | 0.08 | Conservative step size for stable convergence |
| `subsample` | 0.85 | 85% row sampling per tree (reduces variance) |
| `colsample_bytree` | 0.85 | 85% feature sampling per tree (reduces correlation) |
| `objective` | `multi:softprob` | Multiclass softmax probability output |
| `num_class` | 4 | Number of target classes |
| `eval_metric` | `mlogloss` | Multi-class logarithmic loss |
| `random_state` | 42 | Reproducibility seed |
| `n_jobs` | 1 | Single-threaded (deterministic) |
| `sample_weight` | `balanced` | `compute_sample_weight('balanced', y_train)` |

### 7.3 Training Process

1. **Load Data**: Read `data/processed/model_features.csv` (58 labeled samples)
2. **Encode Labels**: Load pre-fitted `LabelEncoder` from `data/models/label_encoder.pkl`
3. **Train/Test Split**: Stratified 80/20 → 46 train / 12 test (`random_state=42`)
4. **Balanced Weighting**: `compute_sample_weight('balanced', y_train)` — inversely proportional to class frequency
5. **Fit Model**: `xgb_model.fit(X_train, y_train, sample_weight=sample_weights_train)`
6. **Save Artifacts**: `xgboost_model.pkl` + `xgboost_metrics.json`

### 7.4 What XGBoost Predicts

The model outputs a **probability distribution** over 4 classes for each input event:

| Class | Description | Class Hazard Weight |
|---|---|---|
| **Industrial Fire** | Acute, high-intensity fire within industrial facility | 1.00 (highest hazard) |
| **Gas Flare** | Continuous high-temperature combustion stack (refinery/petrochemical) | 0.85 |
| **Persistent Industrial Heat** | Chronic operational thermal emission (factories, kilns) | 0.65 |
| **Other Thermal Source** | Non-industrial: crop burning, waste burning, rural fires | 0.25 (lowest hazard) |

---

## 8. Dataset & Ground-Truth Labeling

### 8.1 Dataset Summary

| Metric | Value |
|---|---|
| Total Raw FIRMS Detections | 202 |
| Spatial Clusters (136 total) | 34 multi-event + 102 singletons |
| Ground-Truth Labeled Events | **58** |
| Training Set | 46 (80%) |
| Test Set | 12 (20%) |
| Features | 15 |
| Target Classes | 4 |

### 8.2 Class Distribution in Ground Truth

From [`data/reports/xgboost_metrics.json`](data/reports/xgboost_metrics.json):

| Class | Count | Percentage |
|---|---|---|
| Persistent Industrial Heat | 34 | 58.6% |
| Other Thermal Source | 16 | 27.6% |
| Industrial Fire | 6 | 10.3% |
| Gas Flare | 2 | 3.4% |
| **Total** | **58** | **100%** |

> **⚠ Critical Limitation**: Gas Flare has only **N = 2** samples in the ground truth. This creates high statistical variance for Gas Flare metrics. The model explicitly documents this as a limitation.

### 8.3 Labeling Process

The labeling was a **multi-stage evidence-based human annotation** process:

1. **Candidate Grouping** ([`generate_cluster_analysis.py`](scripts/generate_cluster_analysis.py)): Clusters were categorized into 5 candidate groups (A–E) based on multi-sensor empirical evidence — **before any model training**:
   - **Group A**: Persistent Industrial Heat — multi-date recurrence (≥ 2 dates), span > 10d, within 1500m of industry
   - **Group B**: Gas Flare — nighttime, high ΔT (≥ 25 K), near works/power/generator sites
   - **Group C**: Industrial Fire — acute (0–1d span), close to industry (< 1000m), elevated FRP/TI4, built-up surface (NDBI > 0)
   - **Group D**: Other Thermal Source — remote from industry (> 2500m), high NDVI (> 0.20), rural landscape
   - **Group E**: Ambiguous — intermediate distances (1–2.5 km), mixed signals

2. **Human Review**: Domain experts reviewed candidate clusters using KML overlays on Google Earth, cross-referencing:
   - Satellite imagery context
   - OSM facility metadata
   - Temporal recurrence patterns
   - Spectral index signatures

3. **Final Label Assignment**: The `final_label` column in `AI_READY_DATASET.csv` contains the human-verified labels used for model training.

### 8.4 Key Labeling Example: Cluster 004

The single most important cluster in the dataset:
- **25 nighttime detections** across **21 unique satellite overpass dates** spanning **81 days** (March 7 – May 27)
- Average distance to industry: **388m** → directly inside industrial zone
- High built-up surface index: **NDBI = +0.13**
- Labeled: **Persistent Industrial Heat** (the primary archetype)

---

## 9. Model Evaluation Metrics

### 9.1 Evaluation Protocols

The project uses **three complementary evaluation strategies**, each documented in [`data/reports/xgboost_metrics.json`](data/reports/xgboost_metrics.json):

#### A. Fixed Holdout Test Set (N = 12)

| Metric | Value |
|---|---|
| Accuracy | **100.0%** |
| Macro Precision | **100.0%** |
| Macro Recall | **100.0%** |
| Macro F1 | **100.0%** |
| Weighted F1 | **100.0%** |

**Confusion Matrix** (Test Set):

|  | Gas Flare | Ind. Fire | Other Thermal | Persistent Heat |
|---|---|---|---|---|
| **Gas Flare** | 1 | 0 | 0 | 0 |
| **Ind. Fire** | 0 | 1 | 0 | 0 |
| **Other Thermal** | 0 | 0 | 3 | 0 |
| **Persistent Heat** | 0 | 0 | 0 | 7 |

#### B. Repeated Stratified 2-Fold CV (5 Repeats, 10 Folds Total)

| Metric | Value |
|---|---|
| Mean Accuracy | **97.2%** |
| Mean Weighted F1 | **96.5% ± 3.2%** |

**Why 2-fold?** With only N = 2 Gas Flare samples, the minimum class count dictates `n_splits ≤ 2` for stratified splits to guarantee at least 1 sample per class in each fold.

#### C. Leave-One-Out Cross-Validation (LOOCV, N = 58 Folds)

| Metric | Value |
|---|---|
| Accuracy | **98.3%** (57/58 correct) |
| Macro F1 | **91.3%** |
| Weighted F1 | **98.0%** |

**Per-Class LOOCV Results**:

| Class | Precision | Recall | F1-Score | Support |
|---|---|---|---|---|
| Gas Flare | 1.000 | 0.500 | 0.667 | 2 |
| Industrial Fire | 1.000 | 1.000 | 1.000 | 6 |
| Other Thermal Source | 1.000 | 1.000 | 1.000 | 16 |
| Persistent Industrial Heat | 0.971 | 1.000 | 0.986 | 34 |

**LOOCV Confusion Matrix**:

|  | Gas Flare | Ind. Fire | Other Thermal | Persistent Heat |
|---|---|---|---|---|
| **Gas Flare** | 1 | 0 | 0 | 1 |
| **Ind. Fire** | 0 | 6 | 0 | 0 |
| **Other Thermal** | 0 | 0 | 16 | 0 |
| **Persistent Heat** | 0 | 0 | 0 | 34 |

**Interpretation**: The only LOOCV error is 1 Gas Flare event misclassified as Persistent Industrial Heat — consistent with the N=2 scarcity warning.

### 9.2 XGBoost vs Random Forest Comparison

| Metric | Random Forest | XGBoost | Delta |
|---|---|---|---|
| Holdout Test Accuracy | 91.67% | **100.0%** | **+8.33%** |
| Holdout Weighted F1 | 88.89% | **100.0%** | **+11.11%** |
| CV Weighted F1 | 90.53% | **96.48%** | **+5.95%** |
| LOOCV Accuracy | — | **98.28%** | — |

### 9.3 Feature Importance (XGBoost Average Gain)

From [`data/reports/xgboost_metrics.json`](data/reports/xgboost_metrics.json):

| Rank | Feature | Gain | Interpretation |
|---|---|---|---|
| 1 | `industries_within_2km` | **2.86** | Regional industrial density is the strongest discriminator |
| 2 | `cluster_span_days` | **2.62** | Temporal persistence separates chronic vs acute events |
| 3 | `distance_to_industry` | **2.51** | Proximity to industrial facilities |
| 4 | `industries_within_1km` | **2.26** | Local industrial density |
| 5 | `bright_ti5` | **2.12** | Background thermal state discriminates fire classes |
| 6 | `cluster_event_count` | **2.07** | Number of repeat detections |
| 7 | `cluster_unique_dates` | **1.18** | Temporal sampling breadth |
| 8 | `NDVI` | **0.81** | Vegetation presence → agricultural context |
| 9 | `delta_t` | **0.49** | Sub-pixel combustion contrast |
| 10 | `frp` | **0.33** | Absolute radiative power |
| 11 | `NDBI` | **0.17** | Built-up surface index |
| 12 | `bright_ti4` | **0.14** | Active fire channel temperature |
| 13 | `NDWI` | **0.11** | Water body presence |
| 14 | `industries_within_500m` | **0.00** | Not used by model (too narrow radius) |
| 15 | `daynight` | **0.00** | Not used by model (correlates with other features) |

---

## 10. SHAP / XAI — Explainability

### 10.1 What is SHAP?

**SHAP** = **SH**apley **A**dditive ex**P**lanations

SHAP is a game-theoretic framework based on **Shapley values** from cooperative game theory. For each prediction, it computes the **exact marginal contribution** of every feature to the model's output (log-odds/probability).

**Key Properties**:
- **Additivity**: Sum of all SHAP values + expected value = model prediction
- **Consistency**: If a feature's contribution increases in every possible coalition, its SHAP value increases
- **Local Accuracy**: Explanations are faithful to the actual model computation, not approximations

### 10.2 Implementation in Our Project

**File**: [`scripts/explain_xgboost_shap.py`](scripts/explain_xgboost_shap.py)

```python
explainer = shap.TreeExplainer(model)     # Uses TreeSHAP algorithm
shap_values = explainer.shap_values(X)    # Shape: (58, 15, 4) or list of 4 arrays
```

**`TreeExplainer`** is specifically optimized for tree-based models (XGBoost, LightGBM, RF). It computes **exact** Shapley values in polynomial time (O(TLD²) where T = trees, L = leaves, D = depth), unlike the exponential-time kernel SHAP.

### 10.3 Global Feature Attribution

From [`data/reports/shap_feature_importance.csv`](data/reports/shap_feature_importance.csv):

| Rank | Feature | Global Mean |SHAP| | Top Class Driver |
|---|---|---|---|
| 1 | `industries_within_2km` | **0.538** | Gas Flare (1.706) |
| 2 | `distance_to_industry` | **0.511** | Other Thermal Source (1.598) |
| 3 | `cluster_span_days` | **0.490** | Persistent Industrial Heat (1.579) |
| 4 | `bright_ti5` | **0.291** | Industrial Fire (1.162) |
| 5 | `cluster_event_count` | **0.206** | Persistent Industrial Heat (0.689) |

### 10.4 Class-by-Class SHAP Mechanism

#### Persistent Industrial Heat
- **Dominant Drivers**: `cluster_span_days` (+1.579), `cluster_event_count` (+0.689)
- **Mechanism**: High temporal persistence (> 20 days) and dense nocturnal recurrence near industrial centroids → operational factory emissions

#### Other Thermal Source
- **Dominant Drivers**: `distance_to_industry` (+1.598), `NDVI` (moderate)
- **Mechanism**: Extreme spatial isolation from industry (> 3000m) + high vegetation signal → rural/agricultural crop burning

#### Industrial Fire
- **Dominant Drivers**: `bright_ti5` (+1.162), `distance_to_industry` (< 1000m), `cluster_span_days` (acute ≤ 2d)
- **Mechanism**: High acute radiative power inside an industrial park with zero multi-week persistence

#### Gas Flare
- **Dominant Drivers**: `industries_within_2km` (+1.706), `industries_within_1km` (+0.299)
- **Mechanism**: Extreme petrochemical/refinery clustering density coupled with elevated thermal contrast → flare stack combustion

### 10.5 API-Level SHAP Integration

**File**: [`src/api/app.py`](src/api/app.py) (Lines 244–288, function `_compute_shap_top5`)

Every `/predict` and `/events` API call computes **live SHAP values** for the predicted class:

1. `bundle.explainer.shap_values(X_df)` — compute Shapley values for the single sample
2. Select SHAP vector for the predicted class
3. Sort by absolute SHAP value (descending)
4. Return top-5 as `SHAPContribution` objects with: `feature`, `feature_value`, `shap_value`, `direction`

---

## 11. Risk Engine

### 11.1 Overview

**File**: [`src/risk/risk_engine.py`](src/risk/risk_engine.py)

The Risk Engine computes an **objective, transparent 0–100 composite risk score** for each thermal event. It is completely independent of the ML model's training — it operates **post-prediction** using the ML output as one of five inputs.

### 11.2 Five Risk Components & Weights

| Component | Weight | Score Range | Purpose |
|---|---|---|---|
| **Thermal Severity** | **25%** | 0–100 | Physical thermal intensity from satellite measurements |
| **Industrial Proximity** | **25%** | 0–100 | Spatial relationship to industrial infrastructure |
| **ML Confidence** | **25%** | 0–100 | Model prediction class × confidence |
| **Persistence** | **15%** | 0–100 | Temporal recurrence over observation window |
| **Recurrence** | **10%** | 0–100 | Detection density and nocturnal bias |

**Final Risk Score** = Σ (weight_i × component_score_i), clamped to [0, 100]

### 11.3 Component Scoring Details

#### A. Thermal Score (function `compute_thermal_score`)

| Sub-component | Max Points | Scaling |
|---|---|---|
| FRP | 40 pts | Linear: 0 → 30 MW maps to 0 → 40 pts |
| Brightness TI4 | 35 pts | Linear: 295 K → 370 K maps to 0 → 35 pts |
| Delta T (TI4 − TI5) | 25 pts | Linear: 0 K → 50 K maps to 0 → 25 pts |

#### B. Persistence Score (function `compute_persistence_score`)

| Sub-component | Max Points | Scaling |
|---|---|---|
| Cluster Span Days | 60 pts | Linear: 0 → 80 days maps to 0 → 60 pts |
| Cluster Unique Dates | 40 pts | Linear: 1 → 20 dates maps to 0 → 40 pts |

#### C. Industrial Proximity Score (function `compute_proximity_score`)

| Sub-component | Max Points | Scaling |
|---|---|---|
| Distance to Industry | 50 pts | Inverted decay: 5000m → 0m maps to 0 → 50 pts |
| Density (2km radius) | 20 pts | Linear: 0 → 25 facilities maps to 0 → 20 pts |
| Density (1km radius) | 10 pts | Linear: 0 → 10 facilities maps to 0 → 10 pts |
| NDBI | 20 pts | Linear: −0.20 → +0.30 maps to 0 → 20 pts |

#### D. Recurrence Score (function `compute_recurrence_score`)

| Sub-component | Max Points | Scaling |
|---|---|---|
| Cluster Event Count | 70 pts | Linear: 1 → 25 detections maps to 0 → 70 pts |
| Nocturnal Detection | 30 pts | Night (daynight=0) → 30 pts; Day → 15 pts |

#### E. ML Confidence Score (function `compute_ml_confidence_score`)

```
ML Score = CLASS_HAZARD_WEIGHT × model_confidence × 100
```

| Class | Hazard Weight |
|---|---|
| Industrial Fire | 1.00 |
| Gas Flare | 0.85 |
| Persistent Industrial Heat | 0.65 |
| Other Thermal Source | 0.25 |
| Unknown | 0.50 |

### 11.4 Risk Level Classification

| Risk Score | Level | Color Code |
|---|---|---|
| 0–24 | **LOW** | Green |
| 25–49 | **MODERATE** | Yellow |
| 50–74 | **HIGH** | Orange |
| 75–100 | **CRITICAL** | Red |

### 11.5 Top Risk Factors (Natural Language)

Function `identify_top_risk_factors()` generates human-readable explanations:

- **FRP ≥ 15 MW**: "Severe FRP Power Spike (X MW)"
- **Distance ≤ 500m**: "Immediate Industrial Co-location (X m)"
- **Industrial Fire prediction**: "Acute Industrial Fire Hazard (X% ML conf)"
- **Industries ≥ 15 within 2km**: "Dense Industrial Cluster (X facilities within 2km)"
- **ΔT ≥ 30 K**: "Intense Sub-pixel Combustion Contrast (ΔT = X K)"

---

## 12. Walkthrough: One Thermal Event — Raw Data → Final Risk

### Example: Event FIRMS_0006 (Persistent Industrial Heat)

#### Step 1: Raw FIRMS Detection
```
latitude:   22.97956
longitude:  72.56829
acq_date:   2026-03-07
acq_time:   21:14 (Night)
bright_ti4: 305.71 K
bright_ti5: 294.78 K
frp:        0.97 MW
satellite:  NOAA-20
instrument: VIIRS
daynight:   N
```

#### Step 2: Spatial Matching (Script 04)
- Convert to UTM Zone 43N (EPSG:32643)
- `gpd.sjoin_nearest()` → **Nearest OSM facility: 175.79m** away
- Buffer density count:
  - `industries_within_500m`: **1**
  - `industries_within_1km`: **3**
  - `industries_within_2km`: **8**

#### Step 3: Sentinel-2 Feature Extraction (Script 06)
- Search ±15 days around 2026-03-07
- Best cloud-free Sentinel-2 image found
- Cloud mask applied (SCL bands)
- Computed at 20m resolution:
  - **NDVI**: 0.191 (low vegetation → industrial area)
  - **NDBI**: 0.083 (moderate built-up)
  - **NDWI**: −0.312 (no water)

#### Step 4: Feature Engineering
- `delta_t` = 305.71 − 294.78 = **10.93 K** (diffuse heat, not acute combustion)
- `daynight` = 0 (Night)
- Cluster membership: **Cluster 004** (the dominant persistent cluster)
  - `cluster_event_count`: **25**
  - `cluster_unique_dates`: **21**
  - `cluster_span_days`: **81**

#### Step 5: XGBoost Prediction
The 15-feature vector is fed to the trained model:
```
Predicted Class: Persistent Industrial Heat
Confidence: ~96.5%
Probability Distribution:
  - Persistent Industrial Heat: 96.5%
  - Other Thermal Source: 2.1%
  - Industrial Fire: 1.0%
  - Gas Flare: 0.4%
```

#### Step 6: Risk Scoring

| Component | Calculation | Score |
|---|---|---|
| **Thermal** | FRP: min(1, 0.97/30)×40 = 1.29; TI4: (305.71−295)/(370−295)×35 = 5.00; ΔT: min(1, 10.93/50)×25 = 5.47 | **11.76** |
| **Proximity** | Dist: (5000−175.79)/5000×50 = 48.24; 2km: min(1, 8/25)×20 = 6.40; 1km: min(1, 3/10)×10 = 3.00; NDBI: (0.083+0.20)/0.50×20 = 11.32 | **68.96** |
| **ML Confidence** | 0.65 × 0.965 × 100 = 62.73 | **62.73** |
| **Persistence** | Span: min(1, 81/80)×60 = 60.00; Dates: (21−1)/19×40 = 42.11 | **100.00** |
| **Recurrence** | Count: (25−1)/24×70 = 70.00; Night: 30 | **100.00** |

**Final Risk Score** = 0.25×11.76 + 0.25×68.96 + 0.25×62.73 + 0.15×100.00 + 0.10×100.00
= 2.94 + 17.24 + 15.68 + 15.00 + 10.00 = **60.86**

**Risk Level**: **HIGH** (50–74 range)

**Top Risk Factors**: "Chronic Operational Heat Source (81d persistence); Close Industrial Proximity (176m)"

---

## 13. Important Technical Terms

| Term | Definition |
|---|---|
| **VIIRS** | Visible Infrared Imaging Radiometer Suite — sensor on NOAA-20 and Suomi NPP satellites |
| **FIRMS** | Fire Information for Resource Management System — NASA's global thermal anomaly detection system |
| **FRP** | Fire Radiative Power — total thermal energy emitted by a detected hotspot per unit time, measured in Megawatts |
| **Brightness Temperature** | Temperature of a blackbody that would emit the same radiance as the detected pixel at a specific wavelength (Kelvin) |
| **TI4 Band** | VIIRS I4 channel at 3.74 µm — highly sensitive to sub-pixel active combustion |
| **TI5 Band** | VIIRS I5 channel at 11.45 µm — measures background ambient thermal state |
| **Delta T (ΔT)** | TI4 − TI5 — isolates combustion thermal contrast from background temperature |
| **NDVI** | Normalized Difference Vegetation Index — measures vegetation density from satellite imagery |
| **NDBI** | Normalized Difference Built-up Index — measures impervious/built-up surface from SWIR/NIR |
| **NDWI** | Normalized Difference Water Index — measures water body presence from Green/NIR |
| **DBSCAN** | Density-Based Spatial Clustering of Applications with Noise — groups points within ε-distance |
| **XGBoost** | eXtreme Gradient Boosting — ensemble decision tree algorithm using gradient descent on loss function |
| **SHAP** | SHapley Additive exPlanations — game-theoretic method to compute each feature's marginal contribution |
| **TreeSHAP** | SHAP variant optimized for tree models — computes exact Shapley values in polynomial time |
| **Softmax** | Activation function that converts raw model scores into a probability distribution summing to 1 |
| **LOOCV** | Leave-One-Out Cross-Validation — each sample is the test set once, remaining N−1 are training |
| **Stratified Split** | Train/test partitioning that preserves class proportions in both subsets |
| **Sample Weighting** | Assigning higher loss weight to minority-class samples to counteract class imbalance |
| **Gain (Feature Importance)** | Average improvement in splitting criterion (loss reduction) when a feature is used in XGBoost trees |
| **Confusion Matrix** | N×N table showing true vs predicted class counts for all classes |
| **F1-Score** | Harmonic mean of Precision and Recall — balances false positives and false negatives |
| **Macro F1** | Unweighted average of per-class F1 scores — treats all classes equally regardless of size |
| **Weighted F1** | Average F1 weighted by class support — reflects overall prediction quality proportional to class sizes |
| **UTM Zone 43N** | Universal Transverse Mercator projection for longitude 72°–78°E — used for metric distance calculations |
| **Overpass API** | Public API for querying OpenStreetMap geographic data using the Overpass QL language |
| **GeoJSON** | Open standard format for encoding geographic data structures (points, polygons) |
| **FastAPI** | Modern Python web framework for building RESTful APIs with automatic OpenAPI documentation |
| **SCL** | Scene Classification Layer — Sentinel-2 pixel-level cloud/shadow/snow classification mask |
| **Sentinel-2** | ESA earth observation satellite with 13 multispectral bands at 10–60m resolution |

---

## 14. Possible SIH Judge / Viva Questions with Answers

### Q1: What data source does SUDARSHAN use and how reliable is it?

**Answer**: We use **NASA FIRMS VIIRS NOAA-20 Standard Processing (SP)** data — the science-quality product (not near-real-time). VIIRS has a **375m spatial resolution** at nadir and detects fires with ≥ 0.5 MW FRP. It is the global gold standard for active fire monitoring, used by ISRO, NRSC, and all major disaster agencies worldwide. Our data covers Ahmedabad from March–May 2026, downloaded via NASA's official API in 5-day chunks with deduplication.

---

### Q2: Why did you choose XGBoost over Deep Learning?

**Answer**: Our ground-truth labeled dataset has only **N = 58** validated events. Deep learning requires thousands to millions of samples. XGBoost is specifically designed for structured tabular data with small sample sizes:
- Built-in **L1/L2 regularization** prevents overfitting
- **max_depth = 3** constrains tree complexity
- **Balanced sample weighting** handles our class imbalance
- We achieved **98.3% LOOCV accuracy** — near-perfect generalization on N = 58

---

### Q3: How do you handle the extreme class imbalance? (Gas Flare has only 2 samples!)

**Answer**: We employ three strategies:
1. **Balanced Sample Weights**: `compute_sample_weight('balanced')` assigns inversely proportional weights, so each Gas Flare sample receives ~29× the weight of a Persistent Heat sample during training
2. **Constrained Architecture**: `max_depth = 3` prevents the model from memorizing minority-class patterns
3. **Multi-Protocol Evaluation**: We don't rely on a single accuracy number. We validate with:
   - Fixed holdout (100%)
   - Repeated stratified 2-fold CV (96.5% ± 3.2%)
   - Leave-One-Out CV (98.3%)
   
We explicitly document Gas Flare as a statistical limitation in our reports.

---

### Q4: What is the difference between the ML model and the Risk Engine? Why have both?

**Answer**: They solve **different problems**:
- **XGBoost Model** → answers: *"What TYPE of thermal event is this?"* (Classification: 4 classes)
- **Risk Engine** → answers: *"How DANGEROUS is this event?"* (Scoring: 0–100)

An event classified as "Persistent Industrial Heat" might have LOW risk (small factory) or HIGH risk (near a gas pipeline). The Risk Engine combines **5 independent factors** (thermal intensity, proximity, ML confidence, temporal persistence, recurrence) to produce a nuanced risk assessment. The ML classification is just one of those five inputs (weighted 25%).

---

### Q5: How does SHAP ensure your model is not a "black box"?

**Answer**: SHAP provides **mathematically exact** explanations at two levels:

1. **Global**: Which features matter most overall? → `industries_within_2km` (SHAP = 0.538) is the single most influential feature across all classes
2. **Local**: For *this specific event*, what drove the prediction? → e.g., FIRMS_0006 was classified as Persistent Heat because `cluster_span_days = 81` had a SHAP value of +1.58, pushing strongly toward that class

SHAP values are **additive**: base_value + Σ(SHAP_values) = model_output. This is not an approximation — it's a theorem from cooperative game theory (Shapley, 1953).

---

### Q6: How does your spatial matching work? Why OpenStreetMap?

**Answer**: OpenStreetMap provides the world's largest **free, community-verified** database of industrial facilities. We query all features tagged as `landuse=industrial`, `man_made=works`, `power=plant`, or `power=generator` within our Ahmedabad bounding box.

For each FIRMS hotspot:
1. Convert to metric CRS (UTM Zone 43N, EPSG:32643) for accurate distance calculations
2. `gpd.sjoin_nearest()` finds the **closest OSM facility** and its distance in meters
3. A **2 km buffer** around each point counts facilities at 500m, 1km, and 2km radii using a spatial R-tree index

This tells us: "Is this hotspot inside an industrial zone, near one, or in the middle of farmland?"

---

### Q7: What do NDVI, NDBI, NDWI tell you about a thermal event?

**Answer**: These are **land cover signatures** from Sentinel-2 satellite imagery:

| Index | High Value Means | In Our Context |
|---|---|---|
| **NDVI > 0.25** | Dense vegetation / crops | → Likely crop burning (Other Thermal Source) |
| **NDBI > 0.10** | Concrete / industrial built-up | → Likely industrial origin |
| **NDWI > 0** | Water body | → Cooling pond, unlikely fire |

Example: Event FIRMS_0001 has NDVI = 0.297, NDBI = 0.041, distance = 5784m → remote, vegetated area → correctly classified as **Other Thermal Source** (crop burn).

---

### Q8: Walk us through one prediction end-to-end.

**Answer**: *(Refer to [Section 12](#12-walkthrough-one-thermal-event--raw-data--final-risk) above for the complete FIRMS_0006 walkthrough)*

In summary: Raw VIIRS detection → spatial matching with OSM → Sentinel-2 NDVI/NDBI/NDWI → cluster feature computation → 15-feature vector → XGBoost prediction (Persistent Industrial Heat, 96.5%) → 5-factor Risk Engine → Final Score: 60.86 (HIGH risk) → Frontend dashboard display with SHAP explanation.

---

### Q9: What is "delta_t" and why is it important?

**Answer**: `delta_t = bright_ti4 − bright_ti5`. The TI4 band (3.74 µm) is highly sensitive to **sub-pixel combustion** — even a tiny fire within a 375m pixel causes a massive brightness increase at this wavelength. The TI5 band (11.45 µm) measures the **background ambient temperature**.

- **ΔT > 30 K**: Intense, concentrated combustion → Gas Flare or Industrial Fire
- **ΔT = 10–20 K**: Moderate heat → Persistent Industrial Heat
- **ΔT < 5 K**: Diffuse/ambient → needs other features to discriminate

This is a standard fire detection principle used by NASA's FIRMS algorithm itself.

---

### Q10: Your accuracy is 100% on the test set. Isn't that suspicious?

**Answer**: The test set has only **N = 12** samples. With well-separated classes, 12/12 correct is achievable but not statistically conclusive. That's precisely why we don't stop there:

- **LOOCV (N = 58)**: 98.3% — this is the most rigorous evaluation, where every single sample is tested against a model trained on the other 57. The **one error** is a Gas Flare misclassified as Persistent Heat.
- **Repeated Stratified CV**: 96.5% ± 3.2% — the standard deviation shows the model is stable, not overfitting.

We also document the `statistical_warning` directly in our metrics JSON.

---

### Q11: Can this system work for other cities or regions?

**Answer**: Yes, by design. The only region-specific parameter is the **bounding box** in the FIRMS download scripts. All other components (OSM queries, Sentinel-2 indices, clustering, XGBoost, Risk Engine) are region-agnostic. However, the model would need **re-training** with locally labeled data because:
- Industrial facility types vary by region
- Spectral signatures differ with climate/geography
- Different thermal source distributions (e.g., a refinery city would have more Gas Flares)

---

### Q12: What is the disaster management component of SUDARSHAN?

**Answer**: Beyond detection and classification, SUDARSHAN includes an **Alert & Response** page that:
1. Triages events into **CRITICAL / HIGH / MODERATE / LOW** alert categories using Risk Engine scores
2. Provides a real-time **Active Alerts** feed from the `/events` API
3. Shows **Alert Details** with SHAP explanations and Risk Factor breakdowns
4. Contains placeholder sections for **Recommended Response SOPs** and **Alert History / Audit Trail**

This transforms our system from an analytical tool into an **operational disaster management command center**.

---

### Q13: How does the API work? What happens when the frontend loads?

**Answer**: The backend is a **FastAPI** server ([`api_server.py`](api_server.py)) with three endpoints:

1. **`GET /health`**: Returns model status, loaded classes, and feature count
2. **`POST /predict`**: Single-event inference — accepts 15 features, returns classification + probabilities + risk score + top-5 SHAP explanations
3. **`GET /events`**: Batch endpoint — loads all 58 events from `AI_READY_DATASET.csv`, runs XGBoost + Risk Engine + SHAP for each, caches result, returns full catalog

At **startup** (lifespan hook), the server loads:
- `xgboost_model.pkl` (309 KB)
- `label_encoder.pkl` (4 classes)
- `feature_schema.json` (15 feature names)
- Initializes `shap.TreeExplainer(model)` (cached singleton)

All this happens **once** — no per-request disk I/O.

---

### Q14: What are the limitations of your system?

**Answer**:
1. **Small Dataset**: N = 58 labeled events limits model capacity; Gas Flare (N = 2) is critically under-represented
2. **Single City**: Currently trained only on Ahmedabad data — not validated for generalization
3. **OSM Completeness**: OpenStreetMap may have missing or outdated industrial facility records
4. **Cloud Cover**: Sentinel-2 spectral indices may be unavailable or degraded under persistent cloud cover
5. **375m Resolution**: VIIRS pixel size means small fires may be averaged with surrounding area, reducing ΔT
6. **No Real-Time Processing**: Current system processes historical data; near-real-time pipeline is a future enhancement
7. **Single Satellite**: Using only NOAA-20; combining with Suomi NPP and MODIS would increase temporal coverage

---

### Q15: What would you improve with more time?

**Answer**:
1. **Expand Dataset**: Label more clusters (currently 58/202 events labeled) to improve minority-class representation
2. **Multi-Satellite Fusion**: Add VIIRS Suomi NPP + MODIS Aqua/Terra for more frequent observations
3. **Real-Time Pipeline**: Stream FIRMS NRT data → automatic inference → push notifications
4. **Time-Series Analysis**: Track FRP evolution over time for predictive early warning (fire growth modeling)
5. **Higher Resolution**: Integrate Landsat-8 OLI thermal band (100m) for better spatial discrimination
6. **Ground Validation**: Cross-reference with local fire department records for definitive ground truth
7. **Hyperparameter Optimization**: Bayesian optimization (Optuna) on the XGBoost hyperparameters

---

*Document generated from the actual SUDARSHAN SIH26162 codebase. All values, parameters, and logic traced directly to the source files referenced above.*
