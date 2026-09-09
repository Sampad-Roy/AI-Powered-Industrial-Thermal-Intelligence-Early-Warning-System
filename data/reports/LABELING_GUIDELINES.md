# Supervised Classification Labeling Guidelines
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Artifact**: Standard Operating Procedure (SOP) & Evidence Evaluation Framework  
**Dataset Target**: `data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv` & `EVENT_METADATA.csv`  
**Date**: September 9, 2026  
**Status**: Pre-Labeling Framework (No labels assigned yet)  

---

## 1. Executive Summary & Objective

The objective of this document is to establish a rigorous, scientifically grounded evidence framework for labeling the 202 thermal anomaly events in the SIH26162 handoff dataset into the four prescribed target classes:
1. **Industrial Fire**
2. **Gas Flare**
3. **Persistent Industrial Heat**
4. **Other Thermal Source**

> [!IMPORTANT]
> **Zero Guessing Policy**: No label should be assigned based on arbitrary thresholds or single-variable heuristics. Every label must be supported by verifiable multi-sensor evidence (thermal, temporal recurrence, spatial proximity, and optical surface reflectance).

---

## 2. Multi-Modal Evidence Dimensions

To classify thermal anomalies objectively, four independent streams of satellite and GIS evidence must be synthesized:

```
+-----------------------------------------------------------------------------------+
|                            MULTI-SENSOR EVIDENCE MATRIX                           |
+-------------------------+-------------------------+-------------------------------+
| Stream                  | Primary Features        | Physical / Spatial Meaning    |
+-------------------------+-------------------------+-------------------------------+
| 1. Thermal Intensity    | bright_ti4, bright_ti5, | Planck sub-pixel emission,    |
|    & Physics            | Delta T (ti4 - ti5),    | radiative power output,       |
|                         | frp, confidence         | detection quality             |
+-------------------------+-------------------------+-------------------------------+
| 2. Temporal & Recurrence| acq_date, acq_time,     | Recurrence across dates,      |
|    Persistence          | daynight, cluster_span, | continuous vs episodic vs     |
|                         | unique_dates_500m       | single transient event        |
+-------------------------+-------------------------+-------------------------------+
| 3. Spatial & Industrial | nearest_industry_dist_m,| Direct association with       |
|    Context              | industries_within_500m, | industrial clusters, power,   |
|                         | 1km, 2km, OSM metadata  | works, or remote landscapes   |
+-------------------------+-------------------------+-------------------------------+
| 4. Surface Reflectance  | NDVI, NDBI, NDWI        | Built-up/impervious surface   |
|    (Sentinel-2)         |                         | vs vegetation vs bare ground  |
+-------------------------+-------------------------+-------------------------------+
```

---

## 3. Class-by-Class Evidence Profiles

### Class 1: Industrial Fire
*Definition: An unexpected, acute, and uncontrolled combustion incident occurring within or immediately adjacent to industrial facilities, storage yards, chemical units, or manufacturing plants.*

#### Supporting Empirical Evidence:
- **Spatial Context**: Proximity to industrial infrastructure (`nearest_industry_distance_m < 500m - 1000m` or `industries_within_1km >= 1`). High built-up index (`NDBI > 0.05`) and low vegetative cover (`NDVI < 0.30`).
- **Thermal Behavior**: Elevated Fire Radiative Power (`frp`) and high brightness temperature (`bright_ti4`), representing intense active flame front.
- **Temporal Persistence**: **Strictly transient / episodic**. Detected once or across a very short duration (1 to 2 consecutive overpasses during the active fire event), with **no recurring detections** at the exact same location across subsequent weeks or months.
- **Contextual Signals**: OSM tags such as `industrial`, `works`, chemical / manufacturing names, or container yards.

---

### Class 2: Gas Flare
*Definition: A controlled, continuous or semi-continuous elevated thermal point-source utilized in oil/gas processing, chemical manufacturing, refineries, petrochemical units, and flare stacks.*

#### Supporting Empirical Evidence:
- **Thermal Physics**: Extremely high sub-pixel combustion temperature resulting in a **pronounced difference between VIIRS shortwave IR and thermal IR** ($\Delta T = \text{bright\_ti4} - \text{bright\_ti5} \gg 30\text{ K}$), often triggering high brightness temperatures (`bright_ti4 > 345\text{ K}`) even in small footprint sizes.
- **Temporal Persistence**: High spatial stability over time. Recurrent detections at identical coordinates across multiple dates over the 3-month observation window (`cluster_unique_dates_500m >= 3`).
- **Day/Night Signature**: Readily observable in **night-time overpasses** (`daynight = 0`) where solar background heating is zero, showing high signal-to-noise ratio.
- **Spatial Context**: Co-located with petrochemical, refinery, gas processing, chemical plants, generator units, or heavy industrial zones (`nearest_man_made = works` / `nearest_power = generator` / `nearest_industry_name`).

---

### Class 3: Persistent Industrial Heat
*Definition: Chronic, non-flaming or furnace-related operational thermal emissions from heavy industry, including steel mills, foundries, glass furnaces, kilns, slag cooling, and power generation boilers.*

#### Supporting Empirical Evidence:
- **Temporal Persistence**: **High recurrence and high temporal span** (`cluster_event_count_500m >= 4`, `cluster_span_days_500m > 30` days). Repeated detections occurring systematically across weeks and months.
- **Spatial Context**: Located directly inside dense industrial parks (`nearest_industry_distance_m < 500m`, `industries_within_500m >= 1`, `industries_within_1km >= 3`).
- **Surface Reflectance**: Characteristic impervious industrial surface profile: high built-up signature (`NDBI > 0.10`), low vegetation (`NDVI < 0.20`), and dry surface (`NDWI < -0.25`).
- **Thermal Behavior**: Moderate-to-high steady thermal emissions (`frp` typically steady and moderate, `bright_ti4` moderately elevated) without the extreme sudden spikes characteristic of catastrophic wildland/industrial fires.

---

### Class 4: Other Thermal Source
*Definition: Thermal anomalies unrelated to industrial processes or structures, including agricultural crop residue burning, open biomass/trash burning, landfill surface fires, urban heat artifacts, or rural clearing.*

#### Supporting Empirical Evidence:
- **Spatial Context**: Far from industrial infrastructure (`nearest_industry_distance_m > 2000m - 3000m`, `industries_within_500m = 0`, `industries_within_1km = 0`, `industries_within_2km = 0`).
- **Surface Reflectance**: Distinct agricultural or natural landscape profile: higher vegetation index (`NDVI > 0.35` to `0.85`), negative built-up index (`NDBI < 0.0`), and negative water index (`NDWI`).
- **Temporal Persistence**: Predominantly single-date transient events (`cluster_event_count_500m = 1`, `cluster_unique_dates_500m = 1`), moving across agricultural plots.
- **Thermal Signature**: Daytime agricultural burns (`daynight = 1`), low-to-moderate FRP, often with low-to-nominal confidence flags in open terrain.

---

## 4. Evidence-Based Rules vs. Unverified Assumptions

To ensure data integrity, annotators must maintain a strict boundary between what is provable from satellite/GIS data and what is an ungrounded assumption:

| Dimension | Evidence-Based Rule (Valid Grounding) | Unverified Assumption (Prohibited Heuristic) |
| :--- | :--- | :--- |
| **Recurrence** | Multi-date hotspot clustering over 80+ days indicates persistent heat or fixed stack/flare emissions. | Assuming a single detection in an industrial area is automatically a fire without checking FRP or date context. |
| **Spatial Proximity** | Distance $\le 500\text{m}$ to mapped industrial polygons demonstrates spatial association with industry. | Assuming every event $> 2\text{km}$ from OSM polygons cannot be an unmapped brick kiln or illegal furnace without checking satellite imagery. |
| **Spectral Indices** | $\text{NDBI} > 0.15$ and $\text{NDVI} < 0.15$ confirms non-vegetated, built-up industrial impervious surface. | Assuming $\text{NDVI} > 0.40$ completely rules out a rural agro-industrial processing mill without verifying exact coordinates. |
| **Thermal Delta** | $\Delta T = \text{ti4} - \text{ti5} > 40\text{ K}$ with high nighttime FRP strongly points to high-temperature gas flaring or intense combustion. | Assuming high `frp` alone distinguishes gas flare from large fire without checking temporal recurrence and facility type. |
| **OSM Tagging** | Explicit facility names (e.g. *Reliance resin industries*, *Hydro Power*, *Generator*) provide positive contextual evidence. | Assuming blank OSM tags imply "no industry exists" (OSM mapping is known to have completeness variations). |

---

## 5. Critical Assessment: Is `EVENT_METADATA.csv` Sufficient for 100% Validation?

### Available Strengths in `EVENT_METADATA.csv`:
1. **Exact Spatio-Temporal Coordinates**: Accurate latitude, longitude, acquisition date, and time (`HH:MM`) allow exact multi-temporal hotspot clustering and day/night verification.
2. **Proximity Metrics**: High-precision computed distances to nearest industry (`nearest_industry_distance_km`).
3. **High-Confidence Context for Subset**: 19 named industrial facilities, 22 man-made tags (`works`), and 14 power tags (`generator`/`plant`) provide definitive context for specific events.

### Limitations & Information Gaps:
1. **OSM Attribute Sparsity**:
   - `nearest_industry_name`: Missing for $183 / 202$ events ($90.6\%$).
   - `nearest_industry_type`: Populated for only $1$ event ($0.5\%$).
   - `nearest_landuse`: Recorded as generic `industrial` for $175 / 202$ events ($86.6\%$), but lacks facility sub-type detail (e.g., distinguishing a refinery with flares from a warehouse from a steel foundry).
2. **Absence of Official Incident Ground Truth**:
   - `EVENT_METADATA.csv` does not include official municipal fire department dispatch logs, emergency call records, or industrial flaring permits.
3. **Distinguishing Industrial Fire vs. Episodic Flare**:
   - An episodic flare operating for just 1 day within a chemical complex can look spectrally and spatially identical to a localized, contained industrial equipment fire.

### Formal Conclusion on Context Adequacy:
> **Assessment**: `EVENT_METADATA.csv` provides **sufficient context to establish objective candidate evidence profiles** (especially for *Persistent Industrial Heat* vs. *Other Thermal Source*), but **requires high-resolution optical basemaps (e.g., Google Earth / Sentinel-2 imagery) or fire dispatch validation** for definitive, legally certified labeling of edge-case *Industrial Fire* vs. *Intermittent Gas Flare* events.

---

## 6. Recommended Next Steps for Human Validation

1. **Review Validation Table**: Utilize [`data/reports/label_validation_table.csv`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/label_validation_table.csv) where all 202 events are compiled with multi-sensor metrics, cluster persistence, and contextual summaries.
2. **Cluster-First Annotation**: Review the 25 events belonging to Cluster 4 and other multi-date recurring clusters to validate *Persistent Industrial Heat* and *Gas Flare* signatures as a coherent group.
3. **Outlier Inspection**: Cross-reference high-FRP single-occurrence events located inside dense industrial buffers with Sentinel-2 pre/post imagery to confirm *Industrial Fire* events.
