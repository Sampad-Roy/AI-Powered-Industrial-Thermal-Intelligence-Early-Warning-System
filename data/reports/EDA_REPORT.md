# Exploratory Data Analysis (EDA) Report
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Analyzed**: `data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv`  
**Date**: September 9, 2026  
**Analyst**: AI/ML Team (Handoff from RS & GIS Lead)  

---

## 1. Executive Summary & Dataset Overview
The dataset contains preprocessed multi-sensor features derived from **NASA FIRMS (VIIRS I-Band)**, **OpenStreetMap (OSM) Industrial Context**, **Spatial Proximity & Buffers**, and **Copernicus Sentinel-2 Surface Reflectance (NDVI, NDBI, NDWI)**.

- **Total Observations (Rows)**: `202` events
- **Total Columns**: `15` columns (1 Identifier + 14 Features)
- **Missing / Null Values**: `0` missing values across the entire dataset (100% complete)
- **Duplicate Records**: `0` duplicate rows; `0` duplicate `event_id` keys
- **Supervised Labels**: None assigned yet (Strictly feature dataset as required)

---

## 2. Feature Columns & Data Types

The 15 columns are categorized into 4 core thematic domains as specified in the handoff:

1. **Identifier**:
   - `event_id` (`object` / `string`): Unique event identifier (`FIRMS_0001` to `FIRMS_0202`).
2. **FIRMS Thermal Features**:
   - `bright_ti4` (`float64`): VIIRS Band I4 (3.75 µm) Brightness Temperature in Kelvin.
   - `bright_ti5` (`float64`): VIIRS Band I5 (11.45 µm) Brightness Temperature in Kelvin.
   - `frp` (`float64`): Fire Radiative Power measured in Megawatts (MW).
   - `confidence` (`object` / `string`): VIIRS detection confidence quality flag (`'l'`, `'n'`, `'h'`).
   - `scan` (`float64`): Along-scan pixel resolution dimension in km.
   - `track` (`float64`): Along-track pixel resolution dimension in km.
3. **Temporal Feature**:
   - `daynight` (`int64`): Solar illumination indicator (`1` = Day, `0` = Night).
4. **Industrial Proximity & Density (OSM)**:
   - `nearest_industry_distance_m` (`float64`): Euclidean distance to nearest industrial facility in meters.
   - `industries_within_500m` (`int64`): Count of industrial polygons/nodes within 500m radius.
   - `industries_within_1km` (`int64`): Count of industrial polygons/nodes within 1000m radius.
   - `industries_within_2km` (`int64`): Count of industrial polygons/nodes within 2000m radius.
5. **Sentinel-2 Multi-Spectral Indices**:
   - `NDVI` (`float64`): Normalized Difference Vegetation Index $\frac{\text{NIR} - \text{Red}}{\text{NIR} + \text{Red}}$.
   - `NDBI` (`float64`): Normalized Difference Built-Up Index $\frac{\text{SWIR} - \text{NIR}}{\text{SWIR} + \text{NIR}}$.
   - `NDWI` (`float64`): Normalized Difference Water Index $\frac{\text{Green} - \text{NIR}}{\text{Green} + \text{NIR}}$.

### Data Integrity & Completeness Table
| # | Column Name | Data Type | Non-Null Count | Missing Values | Missing (%) |
| :-: | :--- | :---: | :---: | :---: | :---: |
| 1 | `event_id` | `str` | 202 | 0 | 0.0% |
| 2 | `bright_ti4` | `float64` | 202 | 0 | 0.0% |
| 3 | `bright_ti5` | `float64` | 202 | 0 | 0.0% |
| 4 | `frp` | `float64` | 202 | 0 | 0.0% |
| 5 | `confidence` | `str` | 202 | 0 | 0.0% |
| 6 | `scan` | `float64` | 202 | 0 | 0.0% |
| 7 | `track` | `float64` | 202 | 0 | 0.0% |
| 8 | `daynight` | `int64` | 202 | 0 | 0.0% |
| 9 | `nearest_industry_distance_m` | `float64` | 202 | 0 | 0.0% |
| 10 | `industries_within_500m` | `int64` | 202 | 0 | 0.0% |
| 11 | `industries_within_1km` | `int64` | 202 | 0 | 0.0% |
| 12 | `industries_within_2km` | `int64` | 202 | 0 | 0.0% |
| 13 | `NDVI` | `float64` | 202 | 0 | 0.0% |
| 14 | `NDBI` | `float64` | 202 | 0 | 0.0% |
| 15 | `NDWI` | `float64` | 202 | 0 | 0.0% |

---

## 3. Descriptive Statistics for Numerical Features

| Feature Name | Count | Mean | Std Dev | Min | 25% (Q1) | Median | 75% (Q3) | Max | Skewness | Kurtosis |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `bright_ti4` | 202 | 334.027 | 15.027 | 301.260 | 330.205 | 338.535 | 343.607 | 367.000 | -0.556 | -0.299 |
| `bright_ti5` | 202 | 305.179 | 8.261 | 281.280 | 298.140 | 305.520 | 311.365 | 324.000 | -0.001 | -0.651 |
| `frp` | 202 | 4.832 | 4.105 | 0.280 | 1.870 | 3.770 | 5.978 | 27.490 | +2.042 | +6.251 |
| `scan` | 202 | 0.458 | 0.076 | 0.320 | 0.410 | 0.440 | 0.528 | 0.710 | +0.539 | -0.170 |
| `track` | 202 | 0.507 | 0.107 | 0.360 | 0.420 | 0.500 | 0.610 | 0.750 | +0.303 | -1.110 |
| `daynight` | 202 | 0.752 | 0.433 | 0.000 | 1.000 | 1.000 | 1.000 | 1.000 | -1.179 | -0.617 |
| `nearest_industry_distance_m` | 202 | 2988.617 | 2287.127 | 77.590 | 855.460 | 2509.080 | 4762.090 | 8948.540 | +0.557 | -0.690 |
| `industries_within_500m` | 202 | 0.208 | 0.604 | 0.000 | 0.000 | 0.000 | 0.000 | 6.000 | +5.354 | +42.770 |
| `industries_within_1km` | 202 | 0.916 | 2.066 | 0.000 | 0.000 | 0.000 | 1.000 | 17.000 | +3.925 | +21.743 |
| `industries_within_2km` | 202 | 2.970 | 5.000 | 0.000 | 0.000 | 0.000 | 5.000 | 25.000 | +2.300 | +6.116 |
| `NDVI` | 202 | 0.257 | 0.166 | 0.001 | 0.151 | 0.203 | 0.327 | 0.874 | +1.349 | +1.694 |
| `NDBI` | 202 | 0.089 | 0.121 | -0.392 | 0.041 | 0.108 | 0.160 | 0.312 | -1.277 | +2.636 |
| `NDWI` | 202 | -0.348 | 0.135 | -0.788 | -0.432 | -0.333 | -0.273 | 0.237 | -0.022 | +1.740 |

---

## 4. Value Range & Boundary Validation Checks

Each feature was evaluated against physical and mathematical domain constraints:

1. **Spectral Indices (`NDVI`, `NDBI`, `NDWI`)**:
   - Theoretical limits: $[-1.0, +1.0]$
   - Observed range:
     - `NDVI`: $[0.0011, 0.8736]$ (Non-negative; covers bare soil to dense vegetation)
     - `NDBI`: $[-0.3923, 0.3122]$ (Negative = vegetation/water, Positive = built-up/impervious surfaces)
     - `NDWI`: $[-0.7884, 0.2370]$ (Majority negative, indicating dry/non-water surfaces)
   - **Result**: Valid. No values outside $[-1.0, 1.0]$.

2. **Thermal Brightness Temperatures (`bright_ti4`, `bright_ti5`)**:
   - `bright_ti4`: $[301.26\,\text{K}, 367.00\,\text{K}]$ (Mean: $334.03\,\text{K}$)
   - `bright_ti5`: $[281.28\,\text{K}, 324.00\,\text{K}]$ (Mean: $305.18\,\text{K}$)
   - **Observation**: `bright_ti4` is consistently higher than `bright_ti5`, which is characteristic of sub-pixel high-temperature thermal anomalies (Planck curve sensitivity).
   - **Result**: Valid. No unphysical temperatures ($< 200\,\text{K}$ or $> 600\,\text{K}$).

3. **Fire Radiative Power (`frp`)**:
   - Range: $[0.28\,\text{MW}, 27.49\,\text{MW}]$ (Mean: $4.83\,\text{MW}$, Median: $3.57\,\text{MW}$)
   - Skewness: $+2.042$ (Right-skewed; long tail corresponding to high-intensity industrial/flaring events)
   - **Result**: Valid. Zero negative values.

4. **Spatial Proximity & Buffers (`nearest_industry_distance_m`, `industries_within_*`)**:
   - `nearest_industry_distance_m`: $[77.59\,\text{m}, 8948.54\,\text{m}]$ (Mean: $2988.62\,\text{m}$, Median: $2742.66\,\text{m}$)
   - `industries_within_500m`: Max $6$ facilities.
   - `industries_within_1km`: Max $17$ facilities.
   - `industries_within_2km`: Max $25$ facilities.
   - **Result**: Valid monotonically increasing buffer counts with zero negative distances.

---

## 5. Categorical & Temporal Feature Distributions

### Detection Confidence (`confidence`)
| Confidence Code | Meaning | Count | Proportion (%) |
| :---: | :--- | :---: | :---: |
| `n` | Nominal confidence | 139 | 68.81% |
| `l` | Low confidence | 57 | 28.22% |
| `h` | High confidence | 6 | 2.97% |

### Temporal Observation (`daynight`)
| Day/Night Value | Period | Count | Proportion (%) |
| :---: | :--- | :---: | :---: |
| `1` | Day-time observation | 152 | 75.25% |
| `0` | Night-time observation | 50 | 24.75% |

### Cross-Tabulation (`daynight` vs `confidence`)
| daynight | Low (`l`) | Nominal (`n`) | High (`h`) | Total |
| :---: | :---: | :---: | :---: | :---: |
| Night (`0`) | 0 | 50 | 0 | 50 |
| Day (`1`) | 57 | 89 | 6 | 152 |
| **Total** | **57** | **139** | **6** | **202** |

**Key Finding**: Night-time detections (`daynight = 0`) are exclusively cataloged as nominal confidence (`n`) by VIIRS processing algorithms, whereas day-time observations (`daynight = 1`) contain the full spectrum of low (`l`), nominal (`n`), and high (`h`) confidence flags.

---

## 6. Correlation Analysis

### Top Pairwise Correlations
| Rank | Feature A | Feature B | Pearson Correlation (r) | Direction & Strength |
| :-: | :--- | :--- | :---: | :--- |
| 1 | `NDVI` | `NDWI` | `-0.9306` | Very Strong Negative |
| 2 | `bright_ti4` | `daynight` | `+0.8929` | Very Strong Positive |
| 3 | `industries_within_1km` | `industries_within_2km` | `+0.8186` | Very Strong Positive |
| 4 | `industries_within_500m` | `industries_within_1km` | `+0.8040` | Very Strong Positive |
| 5 | `NDBI` | `NDVI` | `-0.7538` | Strong Negative |
| 6 | `bright_ti5` | `bright_ti4` | `+0.7088` | Strong Positive |
| 7 | `daynight` | `bright_ti5` | `+0.6603` | Strong Positive |
| 8 | `bright_ti4` | `frp` | `+0.6227` | Strong Positive |
| 9 | `nearest_industry_distance_m` | `industries_within_2km` | `-0.6169` | Strong Negative |
| 10 | `NDBI` | `NDWI` | `+0.5887` | Moderate Positive |

### Key Correlation Insights:
1. **Spectral Indices Anti-Correlation**: Strong inverse correlation between `NDVI` and `NDWI` ($r = -0.931$) and `NDVI` and `NDBI` ($r = -0.754$), confirming that high built-up/industrial signatures correlate with reduced vegetative cover.
2. **Thermal & Temporal Coupling**: `bright_ti4` shows strong positive correlation with `daynight` ($r = +0.893$) and `bright_ti5` ($r = +0.709$), reflecting daytime solar background heating alongside thermal emissions.
3. **Multi-Scale Buffer Consistency**: High collinearity across proximity buffers (`industries_within_500m` to `2km` $r > 0.80$), and strong negative correlation with `nearest_industry_distance_m` ($r = -0.617$), confirming spatial coherence.
4. **Thermal Intensity vs Distance**: `frp` and `bright_ti4` exhibit weak correlation with distance, indicating intense thermal events occur both inside industrial clusters and in peripheral zones.

---

## 7. Visualizations Generated

All generated visualization figures are stored under `data/reports/figures/`:

1. **`numerical_distributions.png`**: Histograms with overlaid Kernel Density Estimates (KDE), means, and medians for all 12 continuous and discrete features.
2. **`correlation_heatmap.png`**: Lower triangular Pearson correlation heatmap annotated with coefficient values.
3. **`feature_boxplots.png`**: Multi-panel boxplots illustrating feature spread, quartiles, and outlier distributions.
4. **`categorical_and_temporal_distributions.png`**: Bar charts of `confidence` and `daynight` distributions, alongside thermal intensity by time-of-day.
5. **`spectral_indices_scatter.png`**: 3D projection of Sentinel-2 spectral domain (`NDVI` vs `NDBI` with `NDWI` color-map).

---

## 8. Recommendations for Next ML Phases

1. **Target Class Representation**: When assigning/validating the four target classes (*Industrial Fire*, *Gas Flare*, *Persistent Industrial Heat*, *Other Thermal Source*), ensure multi-modal feature combinations are utilized (e.g., proximity + thermal ratio `ti4/ti5` + `NDBI`).
2. **Feature Engineering Potential**:
   - Thermal Difference: $\Delta T = \text{bright\_ti4} - \text{bright\_ti5}$
   - Normalized Thermal Index / FRP density
   - Proximity decay weights
3. **Scaling & Preprocessing**: Highly skewed features (`frp`, `industries_within_*`, `nearest_industry_distance_m`) will benefit from robust scaling or log transformation for linear/distance-based models.
