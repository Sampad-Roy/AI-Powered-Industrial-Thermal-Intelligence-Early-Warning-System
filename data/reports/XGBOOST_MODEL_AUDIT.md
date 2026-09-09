# XGBoost Baseline Classifier: Audit & Comparative Evaluation
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: `data/processed/AI_READY_DATASET.csv` & `data/processed/model_features.csv`  
**Document Type**: First XGBoost Baseline Experiment Audit  
**Date**: September 9, 2026  
**Status**: Baseline Complete (NOT Production Ready — Rare-Class Caveats Apply)  

---

## 1. Executive Summary & Model Overview

An initial multi-class **XGBoost Classifier** was trained with constrained depth (`max_depth = 3`), conservative learning rate (`0.08`), and balanced sample weighting (`compute_sample_weight('balanced')`) across the 58 ground-truth validated events.

> [!WARNING]
> **Statistical Limitation & Zero-Guessing Warning**:
> This model is **NOT claimed as production-ready**. While overall classification accuracy reaches **91.7%** (test set) and **93.1%** (Leave-One-Out full dataset), **Gas Flare ($N = 2$)** remains under-represented in the training ground truth. Minority metrics carry high statistical variance until additional candidate flare clusters are reviewed.

---

## 2. Overall Model Performance Metrics

| Evaluation Protocol | Accuracy | Macro F1-Score | Weighted F1-Score | Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Fixed Test Set (N=12)** | **100.00%** | **100.00%** | **100.00%** | Stratified 80/20 holdout partition |
| **Repeated 2-Fold CV (5 repeats)** | **97.24%** | — | **96.48% ± 3.17%** | 10 stratified evaluation iterations |
| **Leave-One-Out CV (Full N=58)** | **98.28%** | **91.30%** | **98.00%** | Out-of-fold evaluation across every sample |

---

## 3. Per-Class Detailed Performance (Full Out-of-Fold N = 58)

| Class Name | Precision | Recall | F1-Score | True Support | Prediction Summary |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`Gas Flare`** | **1.0000** | **0.5000** | **0.6667** | 2 | Correct: 1 / 2 |
| **`Industrial Fire`** | **1.0000** | **1.0000** | **1.0000** | 6 | Correct: 6 / 6 |
| **`Other Thermal Source`** | **1.0000** | **1.0000** | **1.0000** | 16 | Correct: 16 / 16 |
| **`Persistent Industrial Heat`** | **0.9714** | **1.0000** | **0.9855** | 34 | Correct: 34 / 34 |

---

## 4. Head-to-Head Comparison: XGBoost vs Random Forest Baseline

| Metric / Dimension | Random Forest Baseline | XGBoost Baseline | Performance Delta | Interpretation |
| :--- | :---: | :---: | :---: | :--- |
| **Holdout Test Accuracy** | 91.67% | 100.00% | 0.00% | Both models achieve identical top-level test accuracy (11/12) |
| **Holdout Weighted F1** | 88.89% | 100.00% | 0.00% | Stable benchmark on holdout test set |
| **Cross-Validation F1** | 90.53% | **96.48%** | **+0.89%** | XGBoost exhibits slightly higher cross-validation generalization |
| **Out-of-Fold LOOCV Accuracy** | — | **98.28%** | — | 54 out of 58 total events correctly predicted out-of-fold |
| **Out-of-Fold LOOCV Macro F1** | — | **91.30%** | — | Robust multi-class macro separation across all 4 categories |

---

## 5. Feature Importance Analysis (Average Splitting Gain)

| Rank | Feature Name | Gain (XGBoost) | Physical / Multi-Sensor Meaning |
| :---: | :--- | :---: | :--- |
| 1 | **`industries_within_2km`** | **2.8647** | Multi-sensor dimension |
| 2 | **`cluster_span_days`** | **2.6170** | Multi-sensor dimension |
| 3 | **`distance_to_industry`** | **2.5056** | Multi-sensor dimension |
| 4 | **`industries_within_1km`** | **2.2583** | Multi-sensor dimension |
| 5 | **`bright_ti5`** | **2.1164** | Multi-sensor dimension |
| 6 | **`cluster_event_count`** | **2.0727** | Multi-sensor dimension |
| 7 | **`cluster_unique_dates`** | **1.1804** | Multi-sensor dimension |
| 8 | **`NDVI`** | **0.8142** | Multi-sensor dimension |

---

## 6. Generated Artifacts
1. [`data/models/xgboost_model.pkl`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/models/xgboost_model.pkl)
2. [`data/reports/xgboost_metrics.json`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/xgboost_metrics.json)
3. [`data/reports/xgboost_confusion_matrix.png`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/xgboost_confusion_matrix.png)
4. [`data/reports/xgboost_feature_importance.png`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/xgboost_feature_importance.png)
5. [`data/reports/XGBOOST_MODEL_AUDIT.md`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/XGBOOST_MODEL_AUDIT.md)