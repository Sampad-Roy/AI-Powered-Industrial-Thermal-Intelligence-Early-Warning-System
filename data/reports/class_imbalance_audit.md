# Class Imbalance & Feature Separation Audit Report
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: data/processed/AI_READY_DATASET.csv & data/processed/model_features.csv  
**Document Type**: Pre-Modeling Statistical & Separability Audit  
**Date**: September 9, 2026  
**Status**: Audit Completed (No Synthetic Data / No Premature Model Training)  

---

## 1. Executive Summary & Class Distribution

`
+-----------------------------------------------------------------------------------------------+
|                                GROUND TRUTH CLASS DISTRIBUTION                                |
+-------------------------------+-----------------------+---------------------------------------+
| Target Class                  | Sample Count (N)      | Percentage of Dataset                 |
+-------------------------------+-----------------------+---------------------------------------+
| Persistent Industrial Heat    | 34 samples            | 58.6%                                 |
| Other Thermal Source          | 16 samples            | 27.6%                                 |
| Industrial Fire               | 6 samples             | 10.3%                                 |
| Gas Flare                     | 2 samples             | 3.4%                                  |
+-------------------------------+-----------------------+---------------------------------------+
| Total Ground Truth Samples    | 58 samples            | 100.0%                                |
+-------------------------------+-----------------------+---------------------------------------+
`

---

## 2. Gas Flare vs Industrial Fire Feature Profiles

### A. All Gas Flare Samples (N = 2)
| event_id | acq_datetime | daynight | bright_ti4 (K) | bright_ti5 (K) | delta_t (K) | FRP (MW) | dist_to_ind (m) | ind_within_2km | cluster_span (d) | NDVI | NDBI | NDWI |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **FIRMS_0152** | 2026-05-07 08:03 | 1 (Day) | 345.41 | 312.14 | 33.27 | 7.03 | 670.0 | 25 | 10 | 0.232 | 0.006 | -0.290 |
| **FIRMS_0170** | 2026-05-17 20:43 | 0 (Night) | 319.84 | 298.52 | 21.32 | 1.51 | 426.6 | 24 | 10 | 0.180 | 0.135 | -0.299 |

### B. All Industrial Fire Samples (N = 6)
| event_id | acq_datetime | daynight | bright_ti4 (K) | bright_ti5 (K) | delta_t (K) | FRP (MW) | dist_to_ind (m) | ind_within_2km | cluster_span (d) | NDVI | NDBI | NDWI |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **FIRMS_0029** | 2026-03-18 08:40 | 1 (Day) | 335.73 | 309.61 | 26.12 | 3.01 | 769.1 | 13 | 0 | 0.076 | 0.084 | -0.133 |
| **FIRMS_0116** | 2026-04-18 08:59 | 1 (Day) | 344.44 | 312.61 | 31.83 | 3.28 | 883.7 | 6 | 2 | 0.171 | 0.195 | -0.292 |
| **FIRMS_0120** | 2026-04-20 08:21 | 1 (Day) | 342.18 | 313.57 | 28.61 | 27.49 | 1110.4 | 5 | 2 | 0.414 | 0.128 | -0.467 |
| **FIRMS_0146** | 2026-04-29 08:53 | 1 (Day) | 348.11 | 312.04 | 36.07 | 9.26 | 622.5 | 6 | 0 | 0.053 | 0.072 | -0.132 |
| **FIRMS_0147** | 2026-04-29 08:53 | 1 (Day) | 343.64 | 311.06 | 32.58 | 5.51 | 802.5 | 7 | 0 | 0.032 | 0.044 | -0.094 |
| **FIRMS_0156** | 2026-05-09 09:05 | 1 (Day) | 341.48 | 313.00 | 28.48 | 2.34 | 846.1 | 2 | 0 | 0.173 | 0.201 | -0.294 |

---

## 3. Feature Separability Analysis: Gas Flare vs Industrial Fire

| Feature | Gas Flare (Mean [Min, Max]) | Industrial Fire (Mean [Min, Max]) | Range Overlap? | Separability Power | Physical Meaning |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **cluster_span_days** | **10.0 d** [10.0, 10.0] | **0.7 d** [0.0, 2.0] | **NO** | **High** | Flares recur across weeks; fires are strictly acute (-2). |
| **industries_within_2km** | **24.5** [24.0, 25.0] | **6.5** [2.0, 13.0] | **NO** | **High** | Flares occur in dense chemical/refinery clusters. |
| **industries_within_1km** | **6.5** [4.0, 9.0] | **1.0** [0.0, 2.0] | **NO** | **High** | Flares are surrounded by dense heavy manufacturing. |
| **daynight** | **0.50** [0, 1] | **1.00** [1, 1] | YES | **Medium** | Flares emit strongly at night; industrial fires occurred during daytime. |
| **distance_to_industry** | **548.3 m** [426.6, 670.0] | **839.0 m** [622.5, 1110.4] | YES | **Medium** | Flares are tightly co-located with facility footprint. |
| **rp** | **4.27 MW** [1.51, 7.03] | **8.48 MW** [2.34, 27.49] | YES | Low | Both have elevated FRP; fires reach higher peak spikes (27.5 MW). |
| **delta_t** | **27.30 K** [21.32, 33.27] | **30.62 K** [26.12, 36.07] | YES | Low | Both exhibit strong thermal contrast ($\Delta T > 20	ext{ K}$). |
| **NDVI / NDBI** | NDVI 0.21, NDBI +0.07 | NDVI 0.15, NDBI +0.12 | YES | Low | Both have low vegetation and positive built-up impervious surface. |

---

## 4. Data Leakage & Split Validity Audit

### A. Data Leakage Assessment
- **Result**: **NO DATA LEAKAGE DETECTED**.
- All 15 features in [model_features.csv](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/processed/model_features.csv) originate from raw satellite telemetry (VIIRS I4/I5, FRP), solar geometry (daynight), Sentinel-2 L2A surface reflectance (NDVI, NDBI, NDWI), or unsupervised spatial/temporal clustering before human annotation.
- No human annotator notes, candidate classes, or post-hoc validation columns are present in $.

### B. Statistical Validity of 80/20 Train/Test Split
- **Finding**: With =2$ Gas Flare samples, an 80/20 split places exactly 1 sample in training and 1 in testing.
- **Impact**: The training sample was a daytime pass (FIRMS_0152, .4	ext{ K}$), while the test sample was a nocturnal pass (FIRMS_0170, .8	ext{ K}$). The Random Forest tree splits could not learn nocturnal flare variance from a single daytime sample, explaining the single test misclassification.

---

## 5. Strategic Recommendations

1. **Evaluation Strategy**: Use **Stratified Repeated K-Fold Cross-Validation** (=3$, Repeats=5) and Leave-One-Out (LOO) rather than a single fixed test split to evaluate rare classes reliably.
2. **Dataset Expansion**: Review and promote high-confidence candidate clusters from the remaining 144 unvalidated events (e.g. Cluster 74 with 3 flare-like anomalies at Esdee Paints) to strengthen Gas Flare representation before final production benchmarking.
3. **Proceeding to XGBoost**: The feature separation is strong on temporal persistence (cluster_span_days) and facility density (industries_within_2km). XGBoost with scale_pos_weight and depth-constrained trees can exploit these exact non-overlapping boundaries effectively.