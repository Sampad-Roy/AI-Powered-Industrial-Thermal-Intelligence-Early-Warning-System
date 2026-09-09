# Batch 2 Human Validation Review & Google Earth Inspection Manual
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Artifact Target**: 15 Selected Priority Events Across 7 Clusters  
**Date**: September 9, 2026  
**Status**: Pre-Validation Review (Zero Labels Assigned / Zero CSV Modifications)  

---

## 1. Batch 2 Overview & Class Diversity Strategy

Batch 2 introduces balanced class diversity across the remaining 173 unvalidated events:
1. **Gas Flare Candidate**: `Cluster_101` (2 events with Day+Night industrial works presence and $\Delta T = 33.3\text{ K}$)
2. **Industrial Fire Candidates**: `Cluster_081` (2 events, including the dataset maximum $27.49\text{ MW}$ spike) & `Cluster_017` (1 event)
3. **Other Thermal Source Candidates**: `Cluster_007` (2 events, $\text{NDVI} = 0.69$) & `Cluster_021` (2 events, $\text{NDVI} = 0.87$)
4. **Persistent Industrial Heat Candidates**: `Cluster_028` (3 events, 22d span, $\text{FRP} = 12.8\text{ MW}$) & `Cluster_094` (2 nocturnal events, 26d span)

---

## 2. Cluster-by-Cluster Detailed Event Records & Inspection Checklists

### Cluster `007` (2 Events | Candidate: **Other Thermal Source**)
- **Recurrence & Dates**: `1 Unique Date(s)` | Temporal Span: `0 Days`
- **Spatial Context**: Average Distance to Industry: `4717.7 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0009` | 2026-03-09 08:08 | `22.91476, 72.33144` | Day (1) | 2.35 | 333.45 | 307.22 | 26.23 | 4575.0 | 0.691 | -0.364 | -0.570 | `n` |
| `FIRMS_0010` | 2026-03-09 08:09 | `22.91593, 72.32841` | Day (1) | 3.78 | 336.60 | 308.55 | 28.05 | 4860.4 | 0.546 | -0.116 | -0.573 | `n` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0009` (`22.91476°N, 72.33144°E`)**:
  - *Target Question*: At 22.91476°N, 72.33144°E (4.5 km from industry, NDVI=0.69), is the hotspot situated inside an open cultivated agricultural field?
  - *Critical Evidence Needed*: Agricultural crop field parcel boundaries, absence of buildings/factories, and post-harvest stubble pattern.
  - *Verification Action*: Confirm open agricultural farmland and zero industrial infrastructure.
- **`FIRMS_0010` (`22.91593°N, 72.32841°E`)**:
  - *Target Question*: At 22.91593°N, 72.32841°E (~300m from FIRMS_0009), does this simultaneous overpass confirm an agricultural field fire front moving across crop plots?
  - *Critical Evidence Needed*: Adjacent farm field parcels with crop residue burn signatures.
  - *Verification Action*: Confirm agricultural stubble fire front co-located with FIRMS_0009.

---

### Cluster `017` (1 Events | Candidate: **Industrial Fire**)
- **Recurrence & Dates**: `1 Unique Date(s)` | Temporal Span: `0 Days`
- **Spatial Context**: Average Distance to Industry: `769.1 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0029` | 2026-03-18 08:40 | `23.02453, 72.59813` | Day (1) | 3.01 | 335.73 | 309.61 | 26.12 | 769.1 | 0.076 | 0.084 | -0.133 | `l` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0029` (`23.02453°N, 72.59813°E`)**:
  - *Target Question*: At 23.02453°N, 72.59813°E (769m to industry), is the anomaly located on an open storage yard, recycling lot, or factory building?
  - *Critical Evidence Needed*: Identification of specific commercial/industrial yard vs residential/vegetation parcel.
  - *Verification Action*: Inspect satellite basemap for open scrap/waste yard or factory structure.

---

### Cluster `021` (2 Events | Candidate: **Other Thermal Source**)
- **Recurrence & Dates**: `1 Unique Date(s)` | Temporal Span: `0 Days`
- **Spatial Context**: Average Distance to Industry: `3966.4 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0033` | 2026-03-21 07:44 | `22.97641, 72.43799` | Day (1) | 3.07 | 342.65 | 297.32 | 45.33 | 3921.3 | 0.503 | -0.146 | -0.535 | `n` |
| `FIRMS_0034` | 2026-03-21 07:44 | `22.97737, 72.43770` | Day (1) | 2.50 | 340.43 | 296.42 | 44.01 | 4011.5 | 0.874 | -0.392 | -0.788 | `n` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0033` (`22.97641°N, 72.43799°E`)**:
  - *Target Question*: At 22.97641°N, 72.43799°E (3.9 km from industry, NDVI=0.50), is the location active farmland or rural scrubland?
  - *Critical Evidence Needed*: Cultivated field patterns, farm access roads, and absence of industrial structures.
  - *Verification Action*: Confirm rural agricultural crop parcel.
- **`FIRMS_0034` (`22.97737°N, 72.43770°E`)**:
  - *Target Question*: At 22.97737°N, 72.43770°E (NDVI=0.874, highest in dataset), is the anomaly situated in dense irrigated vegetation/crop land?
  - *Critical Evidence Needed*: Dense crop canopy / vegetation parcel confirming open-air biomass burning.
  - *Verification Action*: Confirm open agricultural crop burning in dense vegetation.

---

### Cluster `028` (3 Events | Candidate: **Persistent Industrial Heat**)
- **Recurrence & Dates**: `2 Unique Date(s)` | Temporal Span: `22 Days`
- **Spatial Context**: Average Distance to Industry: `1159.1 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0044` | 2026-03-23 08:46 | `22.81513, 72.38505` | Day (1) | 7.84 | 342.66 | 307.47 | 35.19 | 795.6 | 0.146 | 0.217 | -0.295 | `n` |
| `FIRMS_0110` | 2026-04-14 08:34 | `22.81889, 72.38586` | Day (1) | 13.40 | 350.82 | 324.00 | 26.82 | 1179.3 | 0.243 | 0.157 | -0.330 | `n` |
| `FIRMS_0111` | 2026-04-14 08:34 | `22.81947, 72.39011` | Day (1) | 17.01 | 347.22 | 320.52 | 26.70 | 1502.4 | 0.368 | 0.021 | -0.441 | `l` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0044` (`22.81513°N, 72.38505°E`)**:
  - *Target Question*: At 22.81513°N, 72.38505°E (795m to industry, NDBI=+0.22), is there a foundry, brick kiln, or steel re-rolling facility?
  - *Critical Evidence Needed*: Heavy industrial sheds, kilns, chimney stacks, or bulk material storage yards.
  - *Verification Action*: Inspect facility type and check for continuous kiln/furnace operation.
- **`FIRMS_0110` (`22.81889°N, 72.38586°E`)**:
  - *Target Question*: At 22.81889°N, 72.38586°E (1.1 km to industry), does this 13.4 MW thermal source originate from the same industrial complex as FIRMS_0044?
  - *Critical Evidence Needed*: Continuity of industrial plant buildings across the 22-day span (March 23 to April 14).
  - *Verification Action*: Verify if FIRMS_0110 and FIRMS_0044 are co-located at the same manufacturing works.
- **`FIRMS_0111` (`22.81947°N, 72.39011°E`)**:
  - *Target Question*: At 22.81947°N, 72.39011°E (1.5 km to industry), does this 17.0 MW spike on April 14 represent an adjoining kiln/furnace unit or open lot?
  - *Critical Evidence Needed*: Industrial plant boundary alignment vs rural boundary edge.
  - *Verification Action*: Determine whether location is inside factory compound or edge boundary.

---

### Cluster `056` (1 Events | Candidate: **Ambiguous (Review Required)**)
- **Recurrence & Dates**: `1 Unique Date(s)` | Temporal Span: `0 Days`
- **Spatial Context**: Average Distance to Industry: `2317.7 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0083` | 2026-04-01 07:37 | `23.00040, 72.32112` | Day (1) | 1.22 | 330.95 | 304.52 | 26.43 | 2317.7 | 0.222 | 0.158 | -0.341 | `l` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0083` (`23.00040°N, 72.32112°E`)**:
  - *Target Question*: Inspect satellite basemap.
  - *Critical Evidence Needed*: Structural verification.
  - *Verification Action*: Verify ground structure.

---

### Cluster `081` (2 Events | Candidate: **Persistent Industrial Heat**)
- **Recurrence & Dates**: `2 Unique Date(s)` | Temporal Span: `2 Days`
- **Spatial Context**: Average Distance to Industry: `997.0 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0116` | 2026-04-18 08:59 | `22.78016, 72.34639` | Day (1) | 3.28 | 344.44 | 312.61 | 31.83 | 883.7 | 0.171 | 0.195 | -0.292 | `n` |
| `FIRMS_0120` | 2026-04-20 08:21 | `22.78230, 72.34660` | Day (1) | 27.49 | 342.18 | 313.57 | 28.61 | 1110.4 | 0.414 | 0.128 | -0.467 | `l` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0116` (`22.78016°N, 72.34639°E`)**:
  - *Target Question*: At 22.78016°N, 72.34639°E, is the hotspot on an industrial warehouse, factory yard, or adjacent open plot?
  - *Critical Evidence Needed*: Industrial plant boundary confirmation, roof condition, and lack of long-term operational furnaces.
  - *Verification Action*: Examine pre-event (pre-April 18) optical imagery for facility type.
- **`FIRMS_0120` (`22.78230°N, 72.34660°E`)**:
  - *Target Question*: At 22.78230°N, 72.34660°E, does April/May 2026 imagery show post-burn blackened scars, damaged roof panels, or an open storage yard fire?
  - *Critical Evidence Needed*: Visual burn scar, charred ground/roof, or local fire dispatch confirmation for 27.5 MW extreme heat spike on 2026-04-20.
  - *Verification Action*: Compare April 2026 Sentinel-2 / Google Earth imagery before vs after April 20 for fire scar evidence.

---

### Cluster `094` (2 Events | Candidate: **Ambiguous (Review Required)**)
- **Recurrence & Dates**: `2 Unique Date(s)` | Temporal Span: `26 Days`
- **Spatial Context**: Average Distance to Industry: `503.2 m` | Context: `Landuse: industrial`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0140` | 2026-04-26 20:37 | `23.01382, 72.33582` | Night (0) | 2.05 | 313.33 | 299.05 | 14.28 | 494.1 | 0.577 | -0.125 | -0.562 | `n` |
| `FIRMS_0183` | 2026-05-22 20:50 | `23.01477, 72.33630` | Night (0) | 0.76 | 312.20 | 298.79 | 13.41 | 512.4 | 0.138 | 0.052 | -0.192 | `n` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0140` (`23.01382°N, 72.33582°E`)**:
  - *Target Question*: At 23.01382°N, 72.33582°E (494m to industry), is this nocturnal detection (20:37 UTC) centered over an industrial processing plant?
  - *Critical Evidence Needed*: Factory shed roof, boiler house, or industrial boundary alignment.
  - *Verification Action*: Check nighttime heat source location relative to factory roof.
- **`FIRMS_0183` (`23.01477°N, 72.33630°E`)**:
  - *Target Question*: At 23.01477°N, 72.33630°E (512m to industry, 26 days after FIRMS_0140), does this second nocturnal detection confirm recurring operational process heat?
  - *Critical Evidence Needed*: Identical factory compound location with steady low-FRP nocturnal heat emission.
  - *Verification Action*: Confirm multi-date nocturnal persistence over the same factory building.

---

### Cluster `101` (2 Events | Candidate: **Gas Flare**)
- **Recurrence & Dates**: `2 Unique Date(s)` | Temporal Span: `10 Days`
- **Spatial Context**: Average Distance to Industry: `548.3 m` | Context: `Man-made: works`

| Event ID | Date & Time (UTC) | Lat, Lon | Day/Night | FRP (MW) | TI4 (K) | TI5 (K) | $\Delta T$ (K) | Dist (m) | NDVI | NDBI | NDWI | Conf |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `FIRMS_0152` | 2026-05-07 08:03 | `23.02414, 72.26765` | Day (1) | 7.03 | 345.41 | 312.14 | 33.27 | 670.0 | 0.232 | 0.006 | -0.290 | `n` |
| `FIRMS_0170` | 2026-05-17 20:43 | `23.02804, 72.26569` | Night (0) | 1.51 | 319.84 | 298.52 | 21.32 | 426.6 | 0.180 | 0.135 | -0.299 | `n` |

#### Google Earth Visual Inspection Protocol:
- **`FIRMS_0152` (`23.02414°N, 72.26765°E`)**:
  - *Target Question*: Is there an elevated flare derrick/stack or active chemical/petroleum processing plant with burner piping at 23.02414°N, 72.26765°E?
  - *Critical Evidence Needed*: Presence of tall vertical flare pipe with burner tip, knock-out drums, or refinery cracking tower.
  - *Verification Action*: Inspect for elevated flare stack structure vs enclosed factory roof.
- **`FIRMS_0170` (`23.02804°N, 72.26569°E`)**:
  - *Target Question*: At 23.02804°N, 72.26569°E (~450m north of FIRMS_0152), does the nocturnal hotspot align with the same chemical works or an adjoining industrial facility?
  - *Critical Evidence Needed*: Confirmation of contiguous industrial works boundary and continuous nocturnal furnace/stack operations.
  - *Verification Action*: Verify if FIRMS_0152 and FIRMS_0170 originate from the same industrial facility plot.

---

## 3. Human Review Summary & Decision Matrix

| Event ID | Cluster | Candidate Class | Google Earth Visual Inspection Question | Critical Evidence Needed | Recommended Action |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `FIRMS_0009` | `Cluster_007` | **Other Thermal Source** | At 22.91476°N, 72.33144°E (4.5 km from industry, NDVI=0.69), is the hotspot situated inside an open cultivated agricultural field? | Agricultural crop field parcel boundaries, absence of buildings/factories, and post-harvest stubble pattern. | Confirm open agricultural farmland and zero industrial infrastructure. |
| `FIRMS_0010` | `Cluster_007` | **Other Thermal Source** | At 22.91593°N, 72.32841°E (~300m from FIRMS_0009), does this simultaneous overpass confirm an agricultural field fire front moving across crop plots? | Adjacent farm field parcels with crop residue burn signatures. | Confirm agricultural stubble fire front co-located with FIRMS_0009. |
| `FIRMS_0029` | `Cluster_017` | **Industrial Fire** | At 23.02453°N, 72.59813°E (769m to industry), is the anomaly located on an open storage yard, recycling lot, or factory building? | Identification of specific commercial/industrial yard vs residential/vegetation parcel. | Inspect satellite basemap for open scrap/waste yard or factory structure. |
| `FIRMS_0033` | `Cluster_021` | **Other Thermal Source** | At 22.97641°N, 72.43799°E (3.9 km from industry, NDVI=0.50), is the location active farmland or rural scrubland? | Cultivated field patterns, farm access roads, and absence of industrial structures. | Confirm rural agricultural crop parcel. |
| `FIRMS_0034` | `Cluster_021` | **Other Thermal Source** | At 22.97737°N, 72.43770°E (NDVI=0.874, highest in dataset), is the anomaly situated in dense irrigated vegetation/crop land? | Dense crop canopy / vegetation parcel confirming open-air biomass burning. | Confirm open agricultural crop burning in dense vegetation. |
| `FIRMS_0044` | `Cluster_028` | **Persistent Industrial Heat** | At 22.81513°N, 72.38505°E (795m to industry, NDBI=+0.22), is there a foundry, brick kiln, or steel re-rolling facility? | Heavy industrial sheds, kilns, chimney stacks, or bulk material storage yards. | Inspect facility type and check for continuous kiln/furnace operation. |
| `FIRMS_0110` | `Cluster_028` | **Persistent Industrial Heat** | At 22.81889°N, 72.38586°E (1.1 km to industry), does this 13.4 MW thermal source originate from the same industrial complex as FIRMS_0044? | Continuity of industrial plant buildings across the 22-day span (March 23 to April 14). | Verify if FIRMS_0110 and FIRMS_0044 are co-located at the same manufacturing works. |
| `FIRMS_0111` | `Cluster_028` | **Ambiguous (Review Required)** | At 22.81947°N, 72.39011°E (1.5 km to industry), does this 17.0 MW spike on April 14 represent an adjoining kiln/furnace unit or open lot? | Industrial plant boundary alignment vs rural boundary edge. | Determine whether location is inside factory compound or edge boundary. |
| `FIRMS_0083` | `Cluster_056` | **Ambiguous (Review Required)** | None | None | None |
| `FIRMS_0116` | `Cluster_081` | **Persistent Industrial Heat** | At 22.78016°N, 72.34639°E, is the hotspot on an industrial warehouse, factory yard, or adjacent open plot? | Industrial plant boundary confirmation, roof condition, and lack of long-term operational furnaces. | Examine pre-event (pre-April 18) optical imagery for facility type. |
| `FIRMS_0120` | `Cluster_081` | **Persistent Industrial Heat** | At 22.78230°N, 72.34660°E, does April/May 2026 imagery show post-burn blackened scars, damaged roof panels, or an open storage yard fire? | Visual burn scar, charred ground/roof, or local fire dispatch confirmation for 27.5 MW extreme heat spike on 2026-04-20. | Compare April 2026 Sentinel-2 / Google Earth imagery before vs after April 20 for fire scar evidence. |
| `FIRMS_0140` | `Cluster_094` | **Ambiguous (Review Required)** | At 23.01382°N, 72.33582°E (494m to industry), is this nocturnal detection (20:37 UTC) centered over an industrial processing plant? | Factory shed roof, boiler house, or industrial boundary alignment. | Check nighttime heat source location relative to factory roof. |
| `FIRMS_0183` | `Cluster_094` | **Persistent Industrial Heat** | At 23.01477°N, 72.33630°E (512m to industry, 26 days after FIRMS_0140), does this second nocturnal detection confirm recurring operational process heat? | Identical factory compound location with steady low-FRP nocturnal heat emission. | Confirm multi-date nocturnal persistence over the same factory building. |
| `FIRMS_0152` | `Cluster_101` | **Gas Flare** | Is there an elevated flare derrick/stack or active chemical/petroleum processing plant with burner piping at 23.02414°N, 72.26765°E? | Presence of tall vertical flare pipe with burner tip, knock-out drums, or refinery cracking tower. | Inspect for elevated flare stack structure vs enclosed factory roof. |
| `FIRMS_0170` | `Cluster_101` | **Persistent Industrial Heat** | At 23.02804°N, 72.26569°E (~450m north of FIRMS_0152), does the nocturnal hotspot align with the same chemical works or an adjoining industrial facility? | Confirmation of contiguous industrial works boundary and continuous nocturnal furnace/stack operations. | Verify if FIRMS_0152 and FIRMS_0170 originate from the same industrial facility plot. |

---

## 4. Next Step for Annotator
1. Open [`data/reports/batch_2_events.kml`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/batch_2_events.kml) in Google Earth Pro.
2. Inspect each cluster sequentially (Cluster 101 -> 081 -> 017 -> 007 -> 021 -> 028 -> 094).
3. Answer the visual inspection questions and provide your validation decision.