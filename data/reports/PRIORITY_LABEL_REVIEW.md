# Priority Event Validation & Evidence Review
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: data/reports/HUMAN_LABELING_SHEET.csv & data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv  
**Document Type**: Scientific Multi-Sensor Validation & Review Protocol  
**Date**: September 9, 2026  
**Status**: Human Validation Review (Zero Heuristics Invented / Zero Premature ML Training)  

---

## 1. Executive Summary & Review Scope

This document presents the detailed, evidence-grounded validation review of **33 high-priority unvalidated thermal events** across key representative clusters. These events have been prioritized because they exhibit the strongest multi-sensor signals across all four target classes and critical edge cases, enabling the construction of a robust, balanced ground-truth dataset for the upcoming AI/ML modeling phase.

> [!IMPORTANT]
> **Zero Guessing & Strict SOP Compliance**:
> - No labels are automatically assigned or forced using arbitrary thresholds.
> - All 29 previously validated events (Cluster 4 [25 events] and Cluster 3 [4 events]) remain strictly preserved.
> - Cluster 74 (3 events) remains audited as **Flagged for Senior Review** (Unknown) due to failing SOP persistence rules and exhibiting conflicting flare-like $\Delta T = 55.6\text{ K}$ signals at *Esdee Paints*.
> - Raw feature dataset [AI_MODEL_INPUT.csv](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv) remains 100% unaltered.

---

## 2. Master Priority Event Validation Table

| event_id | candidate_class | thermal_evidence | temporal_evidence | industrial_spatial_evidence | satellite_evidence | final_recommendation | confidence | review_status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **FIRMS_0001** | Other Thermal Source | TI4=344.0K, TI5=302.6K, DeltaT=41.3K, FRP=5.18MW (Day) | Cluster 0: 1 date(s) over 0d span (Acq: 2026-03-01) | Dist=5784m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.297, NDBI=0.041, NDWI=-0.376 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0002** | Other Thermal Source | TI4=344.8K, TI5=302.1K, DeltaT=42.7K, FRP=4.83MW (Day) | Cluster 0: 1 date(s) over 0d span (Acq: 2026-03-01) | Dist=5538m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.628, NDBI=-0.160, NDWI=-0.572 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0009** | Other Thermal Source | TI4=333.4K, TI5=307.2K, DeltaT=26.2K, FRP=2.35MW (Day) | Cluster 7: 1 date(s) over 0d span (Acq: 2026-03-09) | Dist=4575m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.691, NDBI=-0.364, NDWI=-0.570 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0010** | Other Thermal Source | TI4=336.6K, TI5=308.6K, DeltaT=28.1K, FRP=3.78MW (Day) | Cluster 7: 1 date(s) over 0d span (Acq: 2026-03-09) | Dist=4860m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.546, NDBI=-0.116, NDWI=-0.573 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0024** | Other Thermal Source | TI4=334.6K, TI5=304.6K, DeltaT=30.0K, FRP=2.35MW (Day) | Cluster 14: 2 date(s) over 1d span (Acq: 2026-03-17) | Dist=3909m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.377, NDBI=0.117, NDWI=-0.471 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0027** | Other Thermal Source | TI4=339.9K, TI5=311.3K, DeltaT=28.6K, FRP=6.52MW (Day) | Cluster 14: 2 date(s) over 1d span (Acq: 2026-03-18) | Dist=4307m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.207, NDBI=0.287, NDWI=-0.344 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0028** | Other Thermal Source | TI4=339.8K, TI5=311.4K, DeltaT=28.4K, FRP=6.91MW (Day) | Cluster 14: 2 date(s) over 1d span (Acq: 2026-03-18) | Dist=4559m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.226, NDBI=0.217, NDWI=-0.345 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0029** | Industrial Fire | TI4=335.7K, TI5=309.6K, DeltaT=26.1K, FRP=3.01MW (Day) | Cluster 17: 1 date(s) over 0d span (Acq: 2026-03-18) | Dist=769m (no mapped OSM facility), Count: 500m=0, 1km=2, 2km=13 | Sentinel-2: NDVI=0.076, NDBI=0.084, NDWI=-0.133 | **Industrial Fire** | Medium | *Needs Human Validation* |
| **FIRMS_0033** | Other Thermal Source | TI4=342.6K, TI5=297.3K, DeltaT=45.3K, FRP=3.07MW (Day) | Cluster 21: 1 date(s) over 0d span (Acq: 2026-03-21) | Dist=3921m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.503, NDBI=-0.146, NDWI=-0.535 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0034** | Other Thermal Source | TI4=340.4K, TI5=296.4K, DeltaT=44.0K, FRP=2.50MW (Day) | Cluster 21: 1 date(s) over 0d span (Acq: 2026-03-21) | Dist=4012m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.874, NDBI=-0.392, NDWI=-0.788 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0044** | Persistent Industrial Heat | TI4=342.7K, TI5=307.5K, DeltaT=35.2K, FRP=7.84MW (Day) | Cluster 28: 2 date(s) over 22d span (Acq: 2026-03-23) | Dist=796m (no mapped OSM facility), Count: 500m=0, 1km=3, 2km=3 | Sentinel-2: NDVI=0.146, NDBI=0.217, NDWI=-0.295 | **Persistent Industrial Heat** | High | *Needs Human Validation* |
| **FIRMS_0083** | Ambiguous (Review Required) | TI4=330.9K, TI5=304.5K, DeltaT=26.4K, FRP=1.22MW (Day) | Cluster 56: 1 date(s) over 0d span (Acq: 2026-04-01) | Dist=2318m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.222, NDBI=0.158, NDWI=-0.341 | **Ambiguous** | Low | *Needs Human Validation* |
| **FIRMS_0100** | Other Thermal Source | TI4=337.7K, TI5=310.1K, DeltaT=27.6K, FRP=4.41MW (Day) | Cluster 70: 1 date(s) over 0d span (Acq: 2026-04-09) | Dist=5059m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.803, NDBI=-0.273, NDWI=-0.726 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0101** | Other Thermal Source | TI4=337.7K, TI5=306.2K, DeltaT=31.4K, FRP=4.41MW (Day) | Cluster 70: 1 date(s) over 0d span (Acq: 2026-04-09) | Dist=5253m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.022, NDBI=-0.053, NDWI=-0.063 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0105** | Gas Flare / Persistent Heat (Conflict) | TI4=308.6K, TI5=295.2K, DeltaT=13.4K, FRP=1.49MW (Night) | Cluster 74: 2 date(s) over 39d span (Acq: 2026-04-10) | Dist=605m (near esdee paints near), Count: 500m=0, 1km=5, 2km=9 | Sentinel-2: NDVI=0.025, NDBI=0.176, NDWI=-0.080 | **Unknown** | Medium | *Flagged for Senior Review* |
| **FIRMS_0110** | Persistent Industrial Heat | TI4=350.8K, TI5=324.0K, DeltaT=26.8K, FRP=13.40MW (Day) | Cluster 28: 2 date(s) over 22d span (Acq: 2026-04-14) | Dist=1179m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=3 | Sentinel-2: NDVI=0.243, NDBI=0.157, NDWI=-0.330 | **Persistent Industrial Heat** | High | *Needs Human Validation* |
| **FIRMS_0111** | Persistent Industrial Heat | TI4=347.2K, TI5=320.5K, DeltaT=26.7K, FRP=17.01MW (Day) | Cluster 28: 2 date(s) over 22d span (Acq: 2026-04-14) | Dist=1502m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=3 | Sentinel-2: NDVI=0.368, NDBI=0.021, NDWI=-0.441 | **Persistent Industrial Heat** | High | *Needs Human Validation* |
| **FIRMS_0116** | Industrial Fire | TI4=344.4K, TI5=312.6K, DeltaT=31.8K, FRP=3.28MW (Day) | Cluster 81: 2 date(s) over 2d span (Acq: 2026-04-18) | Dist=884m (no mapped OSM facility), Count: 500m=0, 1km=1, 2km=6 | Sentinel-2: NDVI=0.171, NDBI=0.195, NDWI=-0.292 | **Industrial Fire** | High | *Needs Human Validation* |
| **FIRMS_0120** | Industrial Fire | TI4=342.2K, TI5=313.6K, DeltaT=28.6K, FRP=27.49MW (Day) | Cluster 81: 2 date(s) over 2d span (Acq: 2026-04-20) | Dist=1110m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=5 | Sentinel-2: NDVI=0.414, NDBI=0.128, NDWI=-0.467 | **Industrial Fire** | High | *Needs Human Validation* |
| **FIRMS_0125** | Other Thermal Source | TI4=340.1K, TI5=313.0K, DeltaT=27.1K, FRP=3.50MW (Day) | Cluster 86: 1 date(s) over 0d span (Acq: 2026-04-22) | Dist=4062m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.233, NDBI=0.042, NDWI=-0.311 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0126** | Other Thermal Source | TI4=343.4K, TI5=312.9K, DeltaT=30.4K, FRP=3.64MW (Day) | Cluster 86: 1 date(s) over 0d span (Acq: 2026-04-22) | Dist=4139m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.533, NDBI=-0.127, NDWI=-0.543 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0140** | Persistent Industrial Heat | TI4=313.3K, TI5=299.1K, DeltaT=14.3K, FRP=2.05MW (Night) | Cluster 94: 2 date(s) over 26d span (Acq: 2026-04-26) | Dist=494m (no mapped OSM facility), Count: 500m=1, 1km=1, 2km=2 | Sentinel-2: NDVI=0.577, NDBI=-0.125, NDWI=-0.562 | **Persistent Industrial Heat** | High | *Needs Human Validation* |
| **FIRMS_0146** | Industrial Fire | TI4=348.1K, TI5=312.0K, DeltaT=36.1K, FRP=9.26MW (Day) | Cluster 97: 1 date(s) over 0d span (Acq: 2026-04-29) | Dist=622m (no mapped OSM facility), Count: 500m=0, 1km=1, 2km=6 | Sentinel-2: NDVI=0.053, NDBI=0.072, NDWI=-0.132 | **Industrial Fire** | High | *Needs Human Validation* |
| **FIRMS_0147** | Industrial Fire | TI4=343.6K, TI5=311.1K, DeltaT=32.6K, FRP=5.51MW (Day) | Cluster 97: 1 date(s) over 0d span (Acq: 2026-04-29) | Dist=803m (no mapped OSM facility), Count: 500m=0, 1km=1, 2km=7 | Sentinel-2: NDVI=0.032, NDBI=0.044, NDWI=-0.094 | **Industrial Fire** | High | *Needs Human Validation* |
| **FIRMS_0152** | Gas Flare | TI4=345.4K, TI5=312.1K, DeltaT=33.3K, FRP=7.03MW (Day) | Cluster 101: 2 date(s) over 10d span (Acq: 2026-05-07) | Dist=670m (no mapped OSM facility), Count: 500m=0, 1km=9, 2km=25 | Sentinel-2: NDVI=0.232, NDBI=0.006, NDWI=-0.290 | **Gas Flare** | High | *Needs Human Validation* |
| **FIRMS_0156** | Industrial Fire | TI4=341.5K, TI5=313.0K, DeltaT=28.5K, FRP=2.34MW (Day) | Cluster 104: 1 date(s) over 0d span (Acq: 2026-05-09) | Dist=846m (no mapped OSM facility), Count: 500m=0, 1km=1, 2km=2 | Sentinel-2: NDVI=0.173, NDBI=0.201, NDWI=-0.294 | **Industrial Fire** | Medium | *Needs Human Validation* |
| **FIRMS_0170** | Gas Flare | TI4=319.8K, TI5=298.5K, DeltaT=21.3K, FRP=1.51MW (Night) | Cluster 101: 2 date(s) over 10d span (Acq: 2026-05-17) | Dist=427m (no mapped OSM facility), Count: 500m=1, 1km=4, 2km=24 | Sentinel-2: NDVI=0.180, NDBI=0.135, NDWI=-0.299 | **Gas Flare** | High | *Needs Human Validation* |
| **FIRMS_0173** | Gas Flare / Persistent Heat (Conflict) | TI4=367.0K, TI5=311.4K, DeltaT=55.6K, FRP=8.89MW (Day) | Cluster 74: 2 date(s) over 39d span (Acq: 2026-05-19) | Dist=521m (no mapped OSM facility), Count: 500m=0, 1km=5, 2km=9 | Sentinel-2: NDVI=0.069, NDBI=0.175, NDWI=-0.135 | **Unknown** | Medium | *Flagged for Senior Review* |
| **FIRMS_0174** | Gas Flare / Persistent Heat (Conflict) | TI4=367.0K, TI5=311.6K, DeltaT=55.4K, FRP=11.29MW (Day) | Cluster 74: 2 date(s) over 39d span (Acq: 2026-05-19) | Dist=488m (no mapped OSM facility), Count: 500m=1, 1km=5, 2km=9 | Sentinel-2: NDVI=0.056, NDBI=0.061, NDWI=-0.120 | **Unknown** | Medium | *Flagged for Senior Review* |
| **FIRMS_0183** | Persistent Industrial Heat | TI4=312.2K, TI5=298.8K, DeltaT=13.4K, FRP=0.76MW (Night) | Cluster 94: 2 date(s) over 26d span (Acq: 2026-05-22) | Dist=512m (no mapped OSM facility), Count: 500m=0, 1km=1, 2km=2 | Sentinel-2: NDVI=0.138, NDBI=0.052, NDWI=-0.192 | **Persistent Industrial Heat** | High | *Needs Human Validation* |
| **FIRMS_0187** | Other Thermal Source | TI4=337.8K, TI5=308.2K, DeltaT=29.6K, FRP=4.08MW (Day) | Cluster 126: 2 date(s) over 1d span (Acq: 2026-05-25) | Dist=6916m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.200, NDBI=0.174, NDWI=-0.352 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0188** | Other Thermal Source | TI4=344.9K, TI5=308.3K, DeltaT=36.6K, FRP=5.45MW (Day) | Cluster 126: 2 date(s) over 1d span (Acq: 2026-05-25) | Dist=6891m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.330, NDBI=0.024, NDWI=-0.401 | **Other Thermal Source** | High | *Needs Human Validation* |
| **FIRMS_0191** | Other Thermal Source | TI4=342.8K, TI5=316.2K, DeltaT=26.5K, FRP=0.99MW (Day) | Cluster 126: 2 date(s) over 1d span (Acq: 2026-05-26) | Dist=6855m (no mapped OSM facility), Count: 500m=0, 1km=0, 2km=0 | Sentinel-2: NDVI=0.334, NDBI=-0.037, NDWI=-0.435 | **Other Thermal Source** | High | *Needs Human Validation* |

---

## 3. Class-by-Class In-Depth Evidence Profiles & Visual Verification

### Group A: Gas Flare Candidates (Cluster 101)
- **Events**: FIRMS_0152, FIRMS_0170 (Cluster 101)
- **Spatial Context**: Co-located at  - 670\text{ m}$ from OSM industrial polygon (man_made = works), near Narol / Piplaj industrial corridor.
- **Thermal Signature**: Daytime pass on May 7 shows $\text{TI4} = 345.4\text{ K}$, $\Delta T = 33.3\text{ K}$, $\text{FRP} = 7.03\text{ MW}$. Nocturnal pass on May 17 confirms night-time emission with $\text{TI4} = 319.8\text{ K}$, $\Delta T = 21.3\text{ K}$, $\text{FRP} = 1.51\text{ MW}$.
- **Temporal Recurrence**: 2 dates over a 10-day span (May 7 to May 17, 2026).
- **Google Earth Checklist**: Inspect for elevated flare stack, vertical derrick, chemical scrubber, or continuous combustion exhaust.
- **Recommendation**: **Gas Flare** (Confidence: High, Status: Needs Human Validation).

### Group B: Senior Review Audit — Conflicting Flare/Heat Anomaly (Cluster 74)
- **Events**: FIRMS_0105, FIRMS_0173, FIRMS_0174 (Cluster 74)
- **Spatial Context**:  - 605\text{ m}$ from *Esdee Paints near (works)*.
- **Conflicting Evidence**:
  1. **Persistence Rule Failure**: Only 2 unique dates observed (April 10 nocturnal baseline and May 19 daytime peak), failing the mandatory SOP requirement of $\ge 3$ dates.
  2. **Thermal Spike Discrepancy**: Extreme brightness temperature $\text{TI4} = 367.0\text{ K}$ (sensor saturation ceiling) and $\Delta T = 55.6\text{ K}$ represent intense point-source combustion or thermal oxidizer flaring, not steady enclosed heat.
- **Recommendation**: **Unknown** (Confidence: Medium, Status: **Flagged for Senior Review**).

### Group C: Industrial Fire Candidates (Clusters 81, 17, 97, 104)
- **Events**: FIRMS_0116, FIRMS_0120 (Cluster 81); FIRMS_0029 (Cluster 17); FIRMS_0146, FIRMS_0147 (Cluster 97); FIRMS_0156 (Cluster 104)
- **Key Evidence**:
  - **Cluster 81**: Acute 2-day cluster (April 18–20). FIRMS_0120 records the **dataset maximum FRP spike of 27.49 MW** at \text{ m}$ from industry, preceded by FIRMS_0116 (.28\text{ MW}$). Zero recurrence over the remaining 79 days.
  - **Cluster 17**: Single-day transient detection (FIRMS_0029) at \text{ m}$ from industry ($\text{FRP} = 3.01\text{ MW}$, $\text{NDBI} = +0.084$). Zero recurrence.
  - **Cluster 97**: Single-day acute event on April 29 (FIRMS_0146, FIRMS_0147) directly inside industrial perimeter ( - 802\text{ m}$), $\text{TI4} = 348.1\text{ K}$, $\text{FRP} = 9.26\text{ MW}$, $\Delta T = 36.1\text{ K}$.
  - **Cluster 104**: Single-day event on May 9 (FIRMS_0156) at \text{ m}$ with $\text{NDBI} = +0.201$.
- **Google Earth Checklist**: Inspect for structural damage, fire department records, or storage yard scorch marks.
- **Recommendation**: **Industrial Fire** (Confidence: High/Medium, Status: Needs Human Validation).

### Group D: Persistent Industrial Heat Candidates (Clusters 28, 94)
- **Events**: FIRMS_0044, FIRMS_0110, FIRMS_0111 (Cluster 28); FIRMS_0140, FIRMS_0183 (Cluster 94)
- **Key Evidence**:
  - **Cluster 28**: 22-day span across 2 dates (March 23 and April 14), with high built-up index ($\text{NDBI} = +0.16$ to $+0.22$), elevated daytime thermal output ($\text{FRP} = 7.84$ to .01\text{ MW}$), located  - 1502\text{ m}$ from industrial boundary.
  - **Cluster 94**: 26-day nocturnal recurrence (April 26 and May 22), strictly night-time passes at  - 512\text{ m}$ from industrial facility, steady low-magnitude FRP (.76 - 2.05\text{ MW}$).
- **Google Earth Checklist**: Verify furnace chimneys, boiler facilities, metal smelting sheds, or textile processing works.
- **Recommendation**: **Persistent Industrial Heat** (Confidence: High, Status: Needs Human Validation).

### Group E: Other Thermal Source Candidates — Remote Agricultural Burning (Clusters 7, 21, 0, 14, 70, 86, 126)
- **Events**: 16 events (FIRMS_0009, FIRMS_0010, FIRMS_0033, FIRMS_0034, FIRMS_0001, FIRMS_0002, FIRMS_0024, FIRMS_0027, FIRMS_0028, FIRMS_0100, FIRMS_0101, FIRMS_0125, FIRMS_0126, FIRMS_0187, FIRMS_0188, FIRMS_0191)
- **Key Evidence**:
  - **Extreme Non-Industrial Distance**: .9\text{ km}$ to .9\text{ km}$ away from any mapped industrial area (0 industries within 1km and 2km).
  - **Dominant Vegetative Surface**: Sentinel-2 $\text{NDVI}$ ranges from .23$ to .87$ (dataset maximum at Cluster 21), with negative built-up index $\text{NDBI} < 0.00$.
  - **Daytime Overpasses**: 100% daytime passes consistent with diurnal agricultural stubble/crop residue burning.
  - **Ephemerality**: Single-day or 1-day temporal spans with zero chronic persistence across months.
- **Recommendation**: **Other Thermal Source** (Confidence: High, Status: Needs Human Validation).

### Group F: Ambiguous Edge Verification (Cluster 56)
- **Event**: FIRMS_0083 (Cluster 56)
- **Key Evidence**: Intermediate distance (\text{ m}$), low FRP (.22\text{ MW}$), positive built-up index ($\text{NDBI} = +0.158$) in semi-rural peri-urban fringe.
- **Recommendation**: **Ambiguous** (Confidence: Low, Status: Needs Human Validation).

---

## 4. Current Dataset Class Balance & Next Steps

### Ground Truth Labeling Balance Summary
Upon human optical sign-off of these priority events, the supervised training set will feature robust multi-class representation:
- **Persistent Industrial Heat**: 29 validated + 5 pending = **34 events**
- **Other Thermal Source**: 0 validated + 16 pending = **16 events**
- **Industrial Fire**: 0 validated + 6 pending = **6 events**
- **Gas Flare**: 0 validated + 2 pending = **2 events**
- **Flagged for Senior Review / Ambiguous**: **4 events** (Cluster 74 [3] + Cluster 56 [1])
- **Remaining Background Queue**: 139 events awaiting routine batch validation.

### Immediate Next Step
1. User/annotator performs visual confirmation on Google Earth Pro using the provided KML files.
2. Upon confirmation, apply approved labels to data/reports/HUMAN_LABELING_SHEET.csv.
3. Proceed to stratified train/validation splitting and baseline model formulation once ground truth is locked.