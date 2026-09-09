# SIH26162: Risk Scoring Engine Audit & Validation Report

## 1. Executive Summary

This audit validates the implementation, execution, and performance of the **Multi-Factor Risk Scoring Engine** on the complete dataset of **202 satellite thermal anomaly events** (VIIRS I-Band 375m observations across Gujarat / Ahmedabad industrial corridors).

### Key Audit Findings:
- **Total Events Scored**: 202 / 202 (100% completion, zero failures, zero NaNs).
- **Score Bounds**: Every event produced sub-scores and a final risk score strictly within $[0.0, 100.0]$.
- **Risk Categorization**:
  - **LOW (0–24)**: 91 events (45.0%) — predominantly rural agricultural clearings and remote open-field burns.
  - **MODERATE (25–49)**: 69 events (34.2%) — intermediate proximity burns, transient industrial anomalies, and low-power combustion.
  - **HIGH (50–74)**: 42 events (20.8%) — confirmed long-duration industrial heat generators and dense cluster thermal events.
  - **CRITICAL (75–100)**: 0 events in the historical archive (requires active catastrophic fire front with extreme FRP > 30MW in dense industrial estate).
- **Test Suite Verification**: 6 test suites comprising 12 automated unit test cases passed with 100% success rate (`tests/test_risk_engine.py`).

---

## 2. Dataset-Level Risk Distribution

### 2.1 Overall Distribution

| Risk Tier | Score Range | Event Count | Percentage | Primary Operational Disposition |
| :--- | :---: | :---: | :---: | :--- |
| **LOW** | 0 – 24.99 | 91 | 45.05% | Routine agricultural / open field; no action needed |
| **MODERATE** | 25.00 – 49.99 | 69 | 34.16% | Watchlist / automated monitoring queue |
| **HIGH** | 50.00 – 74.99 | 42 | 20.79% | Priority industrial inspection / compliance check |
| **CRITICAL** | 75.00 – 100.0 | 0 | 0.00% | Emergency response dispatch / immediate containment |
| **Total** | **0 – 100** | **202** | **100.0%** | Complete Dataset Coverage |

---

### 2.2 Risk Category Breakdown by Predicted Class

| Predicted Class | Total Events | LOW (0–24) | MODERATE (25–49) | HIGH (50–74) | CRITICAL (75–100) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Persistent Industrial Heat** | 39 | 0 (0.0%) | 9 (23.1%) | **30 (76.9%)** | 0 (0.0%) |
| **Industrial Fire** | 32 | 0 (0.0%) | 21 (65.6%) | **11 (34.4%)** | 0 (0.0%) |
| **Gas Flare** | 7 | 0 (0.0%) | 6 (85.7%) | **1 (14.3%)** | 0 (0.0%) |
| **Other Thermal Source** | 124 | **91 (73.4%)** | 33 (26.6%) | 0 (0.0%) | 0 (0.0%) |
| **Dataset Total** | **202** | **91** | **69** | **42** | **0** |

#### Key Takeaways:
1. **Zero False Positives in Rural Class**: Not a single `Other Thermal Source` event was assigned a HIGH or CRITICAL score (highest was 33.72, well within MODERATE).
2. **Industrial Concentration**: 100% of the HIGH risk events (42/42) belong to industrial categories (`Persistent Industrial Heat`, `Industrial Fire`, `Gas Flare`).
3. **Appropriate Differentiation**: `Persistent Industrial Heat` events average a higher final risk score (56.10) due to extreme temporal persistence (up to 81 days) and immediate industrial co-location (<200m).

---

## 3. Class-Wise Sub-Component Profile Analysis

Average sub-component scores (0–100 scale) across each predicted category:

| Predicted Class | Thermal Severity ($S_{\text{therm}}$) | Industrial Proximity ($S_{\text{prox}}$) | Temporal Persistence ($S_{\text{pers}}$) | Recurrence Pattern ($S_{\text{rec}}$) | ML Hazard Score ($S_{\text{ml}}$) | **Final Risk Score ($R$)** |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Persistent Industrial Heat** | 27.03 | **62.73** | **78.43** | **74.13** | **62.59** | **56.10** |
| **Industrial Fire** | 42.38 | 38.65 | 4.39 | 23.36 | 60.30 | **42.86** |
| **Gas Flare** | 23.28 | 58.74 | 22.86 | 32.55 | 44.97 | **42.07** |
| **Other Thermal Source** | **42.63** | 8.84 | 0.22 | 16.79 | 23.95 | **23.26** |

### Analytical Observations:
- **Why Other Thermal Sources have high Thermal Severity (42.63) but low Final Risk (23.26)**:
  Open-field agricultural crop burning produces large visible flames and elevated FRP (often 5–15 MW), giving it a moderate thermal severity score. However, because its industrial proximity is near zero (8.84), persistence is zero (0.22), and ML hazard weight is low ($H=0.25 \to S_{\text{ml}}=23.95$), the composite weighted formula properly suppresses the final score into LOW / lower-MODERATE.
- **Why Persistent Industrial Heat has lower Thermal Severity (27.03) but highest Final Risk (56.10)**:
  Industrial furnaces and smelters operate continuously at steady moderate radiative power (FRP 1–5 MW), but their high proximity (62.73), multi-month persistence (78.43), concentrated recurrence (74.13), and high ML hazard weight drive an elevated composite risk score.

---

## 4. Top 10 Highest-Risk Events in Dataset

| Event ID | Predicted Class | Confidence | Thermal Score | Proximity Score | Persistence Score | Recurrence Score | ML Score | **Final Risk Score** | Risk Level | Key Driving Factors |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `FIRMS_0055` | Persistent Industrial Heat | 96.6% | 36.31 | 74.00 | 100.0 | 100.0 | 62.82 | **68.28** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0036` | Persistent Industrial Heat | 96.6% | 34.50 | 74.00 | 100.0 | 100.0 | 62.81 | **67.83** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0056` | Persistent Industrial Heat | 96.6% | 33.72 | 74.00 | 100.0 | 100.0 | 62.82 | **67.63** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0054` | Persistent Industrial Heat | 96.6% | 32.37 | 74.00 | 100.0 | 100.0 | 62.82 | **67.29** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0017` | Persistent Industrial Heat | 96.6% | 31.95 | 74.00 | 100.0 | 100.0 | 62.80 | **67.19** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0035` | Persistent Industrial Heat | 96.6% | 29.80 | 74.00 | 100.0 | 100.0 | 62.80 | **66.65** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0049` | Persistent Industrial Heat | 96.6% | 28.53 | 74.00 | 100.0 | 100.0 | 62.81 | **66.33** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0016` | Persistent Industrial Heat | 96.7% | 27.50 | 74.00 | 100.0 | 100.0 | 62.84 | **66.08** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0034` | Persistent Industrial Heat | 96.7% | 26.68 | 74.00 | 100.0 | 100.0 | 62.83 | **65.87** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |
| `FIRMS_0028` | Persistent Industrial Heat | 96.6% | 25.15 | 74.00 | 100.0 | 100.0 | 62.82 | **65.49** | **HIGH** | Chronic Operational Heat Source (81d); Immediate Industrial Co-location (239m); Dense Cluster |

---

## 5. Lowest-Risk Events in Dataset

| Event ID | Predicted Class | Confidence | Thermal Score | Proximity Score | Persistence Score | Recurrence Score | ML Score | **Final Risk Score** | Risk Level |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0109` | Other Thermal Source | 97.1% | 21.08 | 0.00 | 0.0 | 15.0 | 24.28 | **12.84** | **LOW** |
| `FIRMS_0108` | Other Thermal Source | 97.1% | 21.08 | 0.00 | 0.0 | 15.0 | 24.28 | **12.84** | **LOW** |
| `FIRMS_0167` | Other Thermal Source | 97.1% | 21.32 | 0.00 | 0.0 | 15.0 | 24.28 | **12.90** | **LOW** |
| `FIRMS_0168` | Other Thermal Source | 97.1% | 21.32 | 0.00 | 0.0 | 15.0 | 24.28 | **12.90** | **LOW** |
| `FIRMS_0185` | Other Thermal Source | 97.1% | 23.49 | 0.00 | 0.0 | 15.0 | 24.28 | **13.44** | **LOW** |

---

## 6. Audit Checks & Compliance Verification

| Audit Check | Status | Verification Detail |
| :--- | :---: | :--- |
| **No Ground-Truth Leakage** | **PASSED** | Formulas exclusively consume raw physical telemetry, cluster geometry, and model inference outputs. |
| **Strict Bounded Range [0, 100]** | **PASSED** | Minimum observed score: `12.84`; Maximum observed score: `68.28`. Zero out-of-bound instances. |
| **Missing / Null Feature Resilience** | **PASSED** | Evaluated on null and NaN payloads in unit tests; fallback defaults gracefully ensure numeric stability. |
| **Deterministic Consistency** | **PASSED** | 100% identical outputs across repeated execution passes. |
| **Model Independence** | **PASSED** | XGBoost model was not retrained, fine-tuned, or modified during risk scoring. |
| **Synthetic Data Absence** | **PASSED** | Zero synthetic or fabricated records were generated or injected. |
