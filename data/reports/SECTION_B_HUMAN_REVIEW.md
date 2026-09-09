# Section B: Priority Human & Google Earth Inspection Protocol
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Target**: `data/reports/HUMAN_LABELING_SHEET.csv`  
**File**: `data/reports/section_b_events.kml`  
**Status**: Awaiting Human Optical Verification (Zero Automatic Labeling)  

---

## 1. Overview of Section B Inspection Queue

Section B comprises **8 high-priority unvalidated events across 5 clusters** that require visual confirmation in Google Earth Pro before final labeling:
1. **Cluster 101 (2 events)**: Candidate `Gas Flare`
2. **Cluster 81 (2 events)**: Candidate `Industrial Fire` (contains dataset maximum 27.49 MW FRP spike)
3. **Cluster 97 (2 events)**: Candidate `Industrial Fire` (acute event inside industrial zone)
4. **Cluster 17 (1 event)**: Candidate `Industrial Fire` (single-day transient detection)
5. **Cluster 104 (1 event)**: Candidate `Industrial Fire` (single-day transient detection)

---

## 2. Event-by-Event Verification Table

| Event ID | Cluster | Candidate Class | Coordinates (Lat, Lon) | Acquisition (UTC) | FRP (MW) | Brightness TI4 (K) | Delta T (K) | Dist to Industry (m) | NDVI | NDBI | Exact Inspection Focus |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **`FIRMS_0152`** | `101` | **Gas Flare** | `(23.024140, 72.267650)` | 2026-05-07 08:03 (Day) | **7.03** | 345.41 | **33.27** | 670.0 | 0.232 | 0.006 | Chemical refinery / flare stack derrick |
| **`FIRMS_0170`** | `101` | **Gas Flare** | `(23.028040, 72.265690)` | 2026-05-17 20:43 (Night) | **1.51** | 319.84 | **21.32** | 426.6 | 0.180 | 0.135 | Night-time flare stack emission footprint |
| **`FIRMS_0116`** | `81` | **Industrial Fire** | `(22.780160, 72.346390)` | 2026-04-18 08:59 (Day) | **3.28** | 344.44 | **31.83** | 883.7 | 0.171 | 0.195 | Precursor fire / warehouse yard combustion |
| **`FIRMS_0120`** | `81` | **Industrial Fire** | `(22.782300, 72.346600)` | 2026-04-20 08:21 (Day) | **27.49** | 342.18 | **28.61** | 1110.4 | 0.414 | 0.128 | **Dataset Maximum FRP Spike**: Scorch / fire damage |
| **`FIRMS_0146`** | `97` | **Industrial Fire** | `(23.018060, 72.674790)` | 2026-04-29 08:53 (Day) | **9.26** | 348.11 | **36.07** | 622.5 | 0.053 | 0.072 | Odhav/Kathwada industrial manufacturing roof |
| **`FIRMS_0147`** | `97` | **Industrial Fire** | `(23.019300, 72.672000)` | 2026-04-29 08:53 (Day) | **5.51** | 343.64 | **32.58** | 802.5 | 0.032 | 0.044 | Co-located plume / storage yard fire |
| **`FIRMS_0029`** | `17` | **Industrial Fire** | `(23.024530, 72.598130)` | 2026-03-18 08:40 (Day) | **3.01** | 335.73 | **26.12** | 769.1 | 0.076 | 0.084 | Central Ahmedabad industrial transit/yard lot |
| **`FIRMS_0156`** | `104` | **Industrial Fire** | `(22.801090, 72.339340)` | 2026-05-09 09:05 (Day) | **2.34** | 341.48 | **28.48** | 846.1 | 0.173 | 0.201 | Bavla industrial shed/manufacturing unit |

---

## 3. Visual Inspection Checklist

### Cluster 101 (`FIRMS_0152`, `FIRMS_0170`) — Gas Flare Candidate
- [ ] Is there an elevated vertical flare stack or combustion derrick at or near `(23.024140, 72.267650)`?
- [ ] Is the facility a petrochemical, gas handling, chemical synthesis, or refinery plant?
- [ ] Is the thermal point source spatially stationary between May 7 and May 17?

### Cluster 81 (`FIRMS_0116`, `FIRMS_0120`) — Industrial Fire Candidate
- [ ] What physical infrastructure exists at `(22.782300, 72.346600)` (factory, chemical unit, open yard, or scrap lot)?
- [ ] Is there visible structural fire damage, collapsed roofing, or black burn scar?
- [ ] Does the massive 27.49 MW FRP spike represent an uncontrolled accidental blaze or an operational test?

### Cluster 97 (`FIRMS_0146`, `FIRMS_0147`) — Industrial Fire Candidate
- [ ] Is the location inside the Odhav / Kathwada industrial GIDC zone?
- [ ] Are the hotspots situated on industrial sheds, warehouses, or open yard spaces?
- [ ] Is there evidence of smoke or transient incident damage on April 29, 2026?

### Cluster 17 (`FIRMS_0029`) — Industrial Fire Candidate
- [ ] Is the location inside a mapped industrial compound, transport yard, or roadside plot?
- [ ] Is there structural roof damage or isolated open debris combustion?

### Cluster 104 (`FIRMS_0156`) — Industrial Fire Candidate
- [ ] Is the hotspot directly over an industrial factory shed or adjacent agricultural boundary?
- [ ] Does the ground show evidence of structural fire incident on May 9, 2026?
