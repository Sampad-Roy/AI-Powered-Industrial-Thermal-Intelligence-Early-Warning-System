# Explainable AI (XAI) Audit: XGBoost Multi-Class Interpretability
**Project**: SIH26162 — AI-Based Detection & Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: `data/processed/AI_READY_DATASET.csv` (N = 58 Validated Events)  
**Framework**: SHAP (Shapley Additive Explanations) TreeExplainer  
**Date**: September 9, 2026  

---

## 1. What SHAP Means in this Project

SHAP (Shapley Additive Explanations) is a cooperative game-theoretic framework that computes the exact marginal contribution of each multi-sensor satellite feature to the XGBoost model's log-odds predictions.

> [!IMPORTANT]
> **Epistemological Integrity & Causality Warning**:
> 1. **SHAP explains the Model, NOT ground-truth physical causality**: A high positive SHAP value indicates that a feature increased the model's mathematical confidence for a class; it is not physical proof of ground conditions.
> 2. **Zero Post-Hoc Leakage**: SHAP values are computed solely from raw satellite/GIS features without knowledge of annotator notes or candidate category names.

---

## 2. Top Global Features Influencing Model Predictions

| Rank | Feature Name | Global Mean |SHAP| | Physical Role in Multi-Sensor Classification |
| :---: | :--- | :---: | :--- |
| 1 | **`industries_within_2km`** | **0.5380** | Primary driver across multi-class decision trees |
| 2 | **`distance_to_industry`** | **0.5110** | Primary driver across multi-class decision trees |
| 3 | **`cluster_span_days`** | **0.4897** | Primary driver across multi-class decision trees |
| 4 | **`bright_ti5`** | **0.2906** | Primary driver across multi-class decision trees |
| 5 | **`cluster_event_count`** | **0.2060** | Primary driver across multi-class decision trees |
| 6 | **`industries_within_1km`** | **0.0856** | Primary driver across multi-class decision trees |
| 7 | **`delta_t`** | **0.0457** | Primary driver across multi-class decision trees |
| 8 | **`bright_ti4`** | **0.0313** | Primary driver across multi-class decision trees |

---

## 3. Class-by-Class Explanatory Mechanisms

### A. `Persistent Industrial Heat`
- **Top Drivers**: `cluster_span_days` (+), `distance_to_industry` (- distance = + heat), `cluster_event_count` (+), `NDBI` (+).
- **Mechanism**: The model strongly associates prolonged observation spans (> 20 days) and dense nocturnal detections near industrial centroids with operational factory emissions.

### B. `Other Thermal Source`
- **Top Drivers**: `distance_to_industry` (+ distance > 3000m = + Other Thermal), `NDVI` (+ high vegetation = + crop burn), `industries_within_2km` (0).
- **Mechanism**: Extreme spatial isolation from industrial polygons combined with high Sentinel-2 vegetative signatures unambiguously dictates rural/agricultural crop burning.

### C. `Industrial Fire`
- **Top Drivers**: `bright_ti5` (+ elevated), `distance_to_industry` (< 1000m), `cluster_span_days` (acute <= 2d), `delta_t` (+).
- **Mechanism**: High acute radiative power inside an industrial park with zero multi-week persistence drives the classification toward acute fire hazard.

### D. `Gas Flare`
- **Top Drivers**: `industries_within_2km` (+ >= 24), `industries_within_1km` (+ >= 4), `distance_to_industry` (426 - 670m).
- **Mechanism**: Extreme petrochemical/refinery clustering density coupled with elevated thermal contrast pushes the prediction toward flare stack combustion.

---

## 4. Example Explanation: Gas Flare vs Industrial Fire

When comparing `FIRMS_0152` (Gas Flare) and `FIRMS_0120` (Industrial Fire):
1. **`industries_within_2km`**: For `FIRMS_0152` (25 industries), SHAP pushes strongly toward Gas Flare (+1.67). For `FIRMS_0120` (5 industries), SHAP pushes away from Gas Flare.
2. **`cluster_span_days`**: For `FIRMS_0152` (10 days), SHAP pushes toward Gas Flare. For `FIRMS_0120` (2 days), SHAP pushes strongly toward Industrial Fire.
3. **`FRP` & `bright_ti4`**: `FIRMS_0120`'s massive 27.49 MW spike provides the decisive SHAP boost for Industrial Fire.

---

## 5. Statistical Caveats: Gas Flare Scarcity (N = 2)
- Because only 2 Gas Flare events exist in ground truth, SHAP attributions for Gas Flare reflect the narrow empirical profile of Cluster 101 (`industries_within_2km` >= 24).
- In wider geography, isolated single-stack refinery flares with lower regional density might not receive this specific attribution boost until additional diverse flare instances are annotated.

---

## 6. Generated XAI Artifacts
1. [`data/reports/shap_global_summary.png`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/shap_global_summary.png)
2. [`data/reports/shap_class_importance.png`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/shap_class_importance.png)
3. [`data/reports/shap_local_examples.md`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/shap_local_examples.md)
4. [`data/reports/shap_feature_importance.csv`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/shap_feature_importance.csv)
5. [`data/reports/XAI_AUDIT.md`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/XAI_AUDIT.md)