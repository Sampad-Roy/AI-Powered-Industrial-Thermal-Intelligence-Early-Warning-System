# Batch 3: Priority Human & Google Earth Verification Protocol
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: `data/reports/HUMAN_LABELING_SHEET.csv`  
**KML Placemark File**: [`data/reports/batch_3_events.kml`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/batch_3_events.kml)  
**Status**: Human Optical Verification in Progress (Zero Premature Labels / Zero Files Modified)  

---

## 1. Master Event Inspection Table (8 Events)

| event_id | Cluster | Candidate Class | Coordinates (Lat, Lon) | Acquisition (UTC) | FRP (MW) | Brightness TI4 (K) | Delta T (K) | Dist to Industry (m) | NDVI | NDBI | Short Google Earth Inspection Checklist |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **`FIRMS_0152`** | `101` | **Gas Flare** | `23.024140, 72.267650` | 2026-05-07 08:03 (Day) | **7.03** | 345.41 | **33.27** | 670.0 | 0.232 | 0.006 | Inspect for elevated flare stack / derrick at chemical works. |
| **`FIRMS_0170`** | `101` | **Gas Flare** | `23.028040, 72.265690` | 2026-05-17 20:43 (Night) | **1.51** | 319.84 | **21.32** | 426.6 | 0.180 | 0.135 | Inspect for elevated flare stack / derrick at chemical works. |
| **`FIRMS_0116`** | `81` | **Industrial Fire** | `22.780160, 72.346390` | 2026-04-18 08:59 (Day) | **3.28** | 344.44 | **31.83** | 883.7 | 0.171 | 0.195 | Inspect warehouse compound for severe scorch / fire damage. |
| **`FIRMS_0120`** | `81` | **Industrial Fire** | `22.782300, 72.346600` | 2026-04-20 08:21 (Day) | **27.49** | 342.18 | **28.61** | 1110.4 | 0.414 | 0.128 | Inspect warehouse compound for severe scorch / fire damage. |
| **`FIRMS_0146`** | `97` | **Industrial Fire** | `23.018060, 72.674790` | 2026-04-29 08:53 (Day) | **9.26** | 348.11 | **36.07** | 622.5 | 0.053 | 0.072 | Inspect Odhav/Kathwada GIDC factory roof for acute fire damage. |
| **`FIRMS_0147`** | `97` | **Industrial Fire** | `23.019300, 72.672000` | 2026-04-29 08:53 (Day) | **5.51** | 343.64 | **32.58** | 802.5 | 0.032 | 0.044 | Inspect Odhav/Kathwada GIDC factory roof for acute fire damage. |
| **`FIRMS_0029`** | `17` | **Industrial Fire** | `23.024530, 72.598130` | 2026-03-18 08:40 (Day) | **3.01** | 335.73 | **26.12** | 769.1 | 0.076 | 0.084 | Inspect manufacturing yard vs open transport lot layout. |
| **`FIRMS_0156`** | `104` | **Industrial Fire** | `22.801090, 72.339340` | 2026-05-09 09:05 (Day) | **2.34** | 341.48 | **28.48** | 846.1 | 0.173 | 0.201 | Inspect industrial factory shed for acute fire damage on May 9. |

---

## 2. Detailed Cluster-by-Cluster Inspection Guide

### A. Cluster 101 — Gas Flare Candidate (2 Events)
- **Events**: `FIRMS_0152` (Day, May 7, FRP = 7.03 MW, Delta T = 33.27 K) and `FIRMS_0170` (Night, May 17, FRP = 1.51 MW, Delta T = 21.32 K)
- **Inspection Center**: `(23.024140, 72.267650)` (Sanand / Viramgam industrial corridor)
- **Key Checklist Items**:
  1. Is there an elevated vertical flare stack, chemical distillation column, or refinery derrick structure?
  2. Is the site an operational chemical synthesis or gas processing facility?
  3. Does the thermal emission originate from a point-source combustion stack rather than an open ground area?

### B. Cluster 81 — Industrial Fire Candidate (2 Events)
- **Events**: `FIRMS_0116` (Day, April 18, FRP = 3.28 MW) and `FIRMS_0120` (Day, April 20, **FRP = 27.49 MW [Dataset Maximum Spike]**)
- **Inspection Center**: `(22.782300, 72.346600)` (Dholka / Bavla industrial corridor)
- **Key Checklist Items**:
  1. What type of facility exists at this coordinate (warehouse, chemical plant, open storage yard, or scrap lot)?
  2. Is there visible structural fire destruction, collapsed metal roofing, or black burn perimeter marks?
  3. Does the massive 27.49 MW spike correspond to an uncontrolled accidental blaze?

### C. Cluster 97 — Industrial Fire Candidate (2 Events)
- **Events**: `FIRMS_0146` (Day, April 29, FRP = 9.26 MW, TI4 = 348.11 K, Delta T = 36.07 K) and `FIRMS_0147` (Day, April 29, FRP = 5.51 MW)
- **Inspection Center**: `(23.018060, 72.674790)` (Odhav / Kathwada GIDC Industrial Estate)
- **Key Checklist Items**:
  1. Are the hotspots situated directly on industrial manufacturing sheds or warehouses inside Odhav GIDC?
  2. Is there evidence of sudden acute fire damage or smoke plume on April 29, 2026?
  3. Are both points part of the same industrial fire incident?

### D. Cluster 17 — Industrial Fire Candidate (1 Event)
- **Event**: `FIRMS_0029` (Day, March 18, FRP = 3.01 MW, Delta T = 26.12 K)
- **Inspection Center**: `(23.024530, 72.598130)` (Central Ahmedabad industrial / railway transit corridor)
- **Key Checklist Items**:
  1. Is the point situated inside an enclosed industrial manufacturing yard or on an open transit/roadside lot?
  2. Is there evidence of single-day acute structural combustion on March 18, 2026?

### E. Cluster 104 — Industrial Fire Candidate (1 Event)
- **Event**: `FIRMS_0156` (Day, May 9, FRP = 2.34 MW, Delta T = 28.48 K, NDBI = +0.201)
- **Inspection Center**: `(22.801090, 72.339340)` (Bavla manufacturing corridor, 2.3 km north of Cluster 81)
- **Key Checklist Items**:
  1. Is the hotspot located directly on an industrial shed / factory roof?
  2. Is there visual evidence of sudden acute fire damage on May 9, 2026?