# SIH26162: Multi-Factor Risk Scoring Engine Methodology

## 1. Executive Summary & Philosophy

The **Multi-Factor Risk Scoring Engine** converts raw satellite infrared observations, spatial geographic context, temporal cluster statistics, and trained machine learning inferences into a unified, transparent, and explainable **Risk Score** ranging strictly from **0 to 100**.

### Key Architectural Principles
1. **Zero Black-Box Scoring**: Every component is bounded, deterministic, and traceable to explicit physical or spatial factors.
2. **Separation of Concerns**: ML confidence represents probabilistic classifier certainty, whereas risk reflects real-world operational and environmental hazard.
3. **Multi-Factor Triangulation**: Physical thermal power, geographic proximity, multi-temporal persistence, and ML hazard classification are combined so that no single noisy sensor reading can distort the final risk rating.
4. **Independent from Ground Truth Labels**: The engine operates purely on input features and model outputs; ground truth labels are strictly prohibited from scoring inputs.

---

## 2. Composite Risk Formula

The **Final Composite Risk Score** ($R$) is a weighted sum of five interpretable sub-component scores, strictly clipped to $[0, 100]$:

$$R = \text{clip}\left(\sum_{k \in \mathcal{K}} w_k \cdot S_k, \; 0, \; 100\right)$$

Where the weights $\mathbf{w}$ sum to $1.00$:

| Component ($k$) | Sub-Score Name | Weight ($w_k$) | Primary Physical / Analytical Dimension |
| :--- | :--- | :---: | :--- |
| **Thermal** | $S_{\text{thermal}}$ | **0.25 (25%)** | Radiative energy, peak temperature, sub-pixel contrast |
| **Proximity** | $S_{\text{proximity}}$ | **0.25 (25%)** | Distance to industrial estate, facility density, built-up index |
| **ML Hazard** | $S_{\text{ml}}$ | **0.25 (25%)** | Class-specific hazard weight scaled by ML prediction confidence |
| **Persistence** | $S_{\text{persistence}}$ | **0.15 (15%)** | Multi-day duration span and unique active dates |
| **Recurrence** | $S_{\text{recurrence}}$ | **0.10 (10%)** | Clustered detection frequency and nocturnal thermal activity |

---

## 3. Detailed Component Sub-Score Formulations

Each component $S_k$ produces an independent score strictly bounded within $[0, 100]$.

### 3.1 Thermal Severity Score ($S_{\text{thermal}}$)
Measures the acute physical radiative intensity and sub-pixel combustion contrast of the anomaly.

$$S_{\text{thermal}} = \text{clip}\left(P_{\text{FRP}} + P_{\text{TI4}} + P_{\Delta T}, \; 0, \; 100\right)$$

1. **Fire Radiative Power ($P_{\text{FRP}}$, max 40 points)**:
   $$P_{\text{FRP}} = \min\left(1.0, \; \frac{\text{FRP}}{30.0}\right) \times 40.0$$
   *Rationale*: 30 MW represents severe industrial combustion or uncontrolled flame fronts. Nominal rural clearings typically register below 5 MW.

2. **Mid-Wave Infrared Peak Brightness ($P_{\text{TI4}}$, max 35 points)**:
   $$P_{\text{TI4}} = \text{clip}\left(\frac{\text{bright\_ti4} - 295.0}{370.0 - 295.0}, \; 0.0, \; 1.0\right) \times 35.0$$
   *Rationale*: Background ambient temperature is ~295 K. Temperatures exceeding 367 K approach sensor saturation and indicate intense active flaming.

3. **Sub-Pixel Combustion Contrast ($P_{\Delta T}$, max 25 points)**:
   $$\Delta T = \text{bright\_ti4} - \text{bright\_ti5}$$
   $$P_{\Delta T} = \min\left(1.0, \; \frac{\max(0, \Delta T)}{50.0}\right) \times 25.0$$
   *Rationale*: High $\Delta T$ ($>30\text{ K}$) strongly differentiates localized sub-pixel combustion (gas flares, industrial stacks, active fires) from uniform solar ground heating.

---

### 3.2 Industrial Proximity Score ($S_{\text{proximity}}$)
Quantifies geographic exposure and proximity to registered manufacturing and processing infrastructure.

$$S_{\text{proximity}} = \text{clip}\left(P_{\text{dist}} + P_{\text{dens2k}} + P_{\text{dens1k}} + P_{\text{NDBI}}, \; 0, \; 100\right)$$

1. **Proximity to Nearest Industrial Boundary ($P_{\text{dist}}$, max 50 points)**:
   $$P_{\text{dist}} = \max\left(0.0, \; \frac{5000.0 - d_{\text{industry}}}{5000.0}\right) \times 50.0$$
   *Rationale*: Direct co-location ($d = 0\text{ m}$) receives 50 pts; linear decay drops to 0 pts at a 5 km buffer.

2. **Regional Industrial Density ($P_{\text{dens}}$, max 30 points)**:
   - **Facilities within 2 km** ($P_{\text{dens2k}}$, max 20 pts): $\min(1.0, \frac{N_{\text{ind2km}}}{25}) \times 20.0$
   - **Facilities within 1 km** ($P_{\text{dens1k}}$, max 10 pts): $\min(1.0, \frac{N_{\text{ind1km}}}{10}) \times 10.0$
   *Rationale*: Denser industrial zones (e.g., GIDC industrial estates) pose higher collateral exposure risk.

3. **Surface Built-Up Index ($P_{\text{NDBI}}$, max 20 points)**:
   $$P_{\text{NDBI}} = \text{clip}\left(\frac{\text{NDBI} - (-0.20)}{0.30 - (-0.20)}, \; 0.0, \; 1.0\right) \times 20.0$$
   *Rationale*: High positive NDBI confirms impervious surfaces, concrete, and roof structures beneath the sensor footprint.

---

### 3.3 Temporal Persistence Score ($S_{\text{persistence}}$)
Identifies continuous, long-duration thermal signatures versus transient one-off anomalies.

$$S_{\text{persistence}} = \text{clip}\left(P_{\text{span}} + P_{\text{dates}}, \; 0, \; 100\right)$$

1. **Cluster Span Days ($P_{\text{span}}$, max 60 points)**:
   $$P_{\text{span}} = \min\left(1.0, \; \frac{\text{span\_days}}{80.0}\right) \times 60.0$$
   *Rationale*: Scaled across the VIIRS temporal observation window (up to 80+ days).

2. **Cluster Unique Observation Dates ($P_{\text{dates}}$, max 40 points)**:
   $$P_{\text{dates}} = \min\left(1.0, \; \frac{\max(1, N_{\text{dates}}) - 1}{19.0}\right) \times 40.0$$
   *Rationale*: Single-date anomalies receive 0 pts; repeated observations across 20+ separate satellite passes receive the full 40 pts.

---

### 3.4 Recurrence Pattern Score ($S_{\text{recurrence}}$)
Measures concentrated detection frequency and nocturnal operational behavior.

$$S_{\text{recurrence}} = \text{clip}\left(P_{\text{count}} + P_{\text{nocturnal}}, \; 0, \; 100\right)$$

1. **Cluster Event Count ($P_{\text{count}}$, max 70 points)**:
   $$P_{\text{count}} = \min\left(1.0, \; \frac{\max(1, N_{\text{events}}) - 1}{24.0}\right) \times 70.0$$
   *Rationale*: Scaled up to 25 detections within a 500m spatial radius.

2. **Nocturnal vs Diurnal Overpass ($P_{\text{nocturnal}}$, max 30 points)**:
   - **Night-time overpass** (`daynight = 0`): **30 points**
   - **Daytime overpass** (`daynight = 1`): **15 points**
   *Rationale*: Night-time detections eliminate solar reflection noise and signify active nighttime combustion or furnace operations.

---

### 3.5 ML Hazard Multiplier Score ($S_{\text{ml}}$)
Translates the XGBoost classifier's category prediction and calibrated probability into an actionable hazard scale.

$$S_{\text{ml}} = \text{clip}\left(H(\hat{y}) \times P(\hat{y}) \times 100.0, \; 0, \; 100\right)$$

Where $H(\hat{y})$ is the predefined class hazard coefficient:

| Predicted Class ($\hat{y}$) | Hazard Coefficient $H(\hat{y})$ | Operational Hazard Rationale |
| :--- | :---: | :--- |
| **Industrial Fire** | **1.00** | Acute uncontrolled thermal disaster; maximum priority response |
| **Gas Flare** | **0.85** | High-temperature uncontained combustion stack; potential emissions / safety hazard |
| **Persistent Industrial Heat** | **0.65** | Continuous high-temperature manufacturing process; ongoing operational monitoring |
| **Other Thermal Source** | **0.25** | Agricultural clearing or open-field burn; low industrial emergency priority |
| **Unknown / Unassigned** | **0.50** | Default neutral hazard baseline for unclassified anomalies |

---

## 4. Standardized Risk Levels

The final score $R \in [0, 100]$ maps to four standardized alert tiers:

| Score Range | Risk Level | Operational Interpretation & Recommended Action |
| :---: | :---: | :--- |
| **0 – 24** | **LOW** | Routine rural anomaly, open field stubble burning, or remote non-hazardous thermal source. No industrial intervention required. |
| **25 – 49** | **MODERATE** | Elevated thermal signature, intermediate industrial proximity, or transient low-confidence anomaly. Automated monitoring queue. |
| **50 – 74** | **HIGH** | Confirmed chronic industrial heat generator, active flare stack, or high-intensity thermal anomaly near industrial infrastructure. Requires facility verification. |
| **75 – 100** | **CRITICAL** | Acute emergency hazard: High-confidence Industrial Fire or catastrophic thermal anomaly in high-density industrial zone. Immediate dispatch / alert trigger. |

---

## 5. Robustness & Safety Controls

1. **Strict Score Bounding**: All sub-scores and final scores are clipped via `np.clip(score, 0.0, 100.0)`.
2. **Missing Feature Immunity**: In the event of missing telemetry (null FRP, null distance, null cluster stats), safe conservative defaults are injected (e.g. ambient baseline temperature, neutral density, rural distance) ensuring the engine never crashes or generates NaN outputs.
3. **Deterministic Output**: Given the same input record, the score is 100% mathematically reproducible.
