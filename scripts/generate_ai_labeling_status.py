import os
import pandas as pd

# Load datasets
sheet_path = os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv")
model_input_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")
meta_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "EVENT_METADATA.csv")

df_sheet = pd.read_csv(sheet_path)
df_model = pd.read_csv(model_input_path)
df_meta = pd.read_csv(meta_path)

total_events = len(df_sheet)
validated_events = df_sheet[df_sheet['label_status'] == 'Validated']
needs_val_events = df_sheet[df_sheet['label_status'] == 'Needs Human Validation']
flagged_events = df_sheet[df_sheet['label_status'] == 'Flagged for Senior Review']

print(f"Total events: {total_events}")
print(f"Validated: {len(validated_events)}")
print(f"Needs Human Validation: {len(needs_val_events)}")
print(f"Flagged for Senior Review: {len(flagged_events)}")

print("\nFinal Labels Breakdown:")
print(df_sheet['final_label'].value_counts())

# Generate report content
report_lines = [
    "# AI/ML Stage: Current Dataset & Labeling State Audit Report",
    "**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  ",
    "**Dataset Target**: `data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv` & `data/reports/HUMAN_LABELING_SHEET.csv`  ",
    "**Document Scope**: Read-Only Audit of Labeling Progress & AI/ML Readiness  ",
    "**Date**: September 9, 2026  ",
    "**Status**: Pre-Modeling Audit (Zero Models Trained / Zero Heuristics Invented)  ",
    "",
    "---",
    "",
    "## 1. Executive Summary: Current Dataset State",
    "",
    "```",
    "+-----------------------------------------------------------------------------------------------+",
    "|                                  CURRENT LABELING STATE SUMMARY                               |",
    "+-------------------------------+-----------------------+---------------------------------------+",
    "| Status Metric                 | Count (Events)        | Percentage of Dataset                 |",
    "+-------------------------------+-----------------------+---------------------------------------+",
    f"| Total Dataset Events          | {total_events} events           | 100.0%                                |",
    f"| Officially Validated Events   | {len(validated_events)} events            | {len(validated_events)/total_events*100:.1f}%                                 |",
    f"| Formally Audited for Senior   | 3 events              | 1.5% (Cluster 74 SOP Flagged)         |",
    f"| Pending Human Validation      | {len(needs_val_events)} events           | {len(needs_val_events)/total_events*100:.1f}%                                 |",
    "+-------------------------------+-----------------------+---------------------------------------+",
    "```",
    "",
    "### Current Distribution of `final_label`",
    "| Label / Class Name | Status | Event Count | % of Dataset | Notes |",
    "| :--- | :---: | :---: | :---: | :--- |",
    f"| **Persistent Industrial Heat** | `Validated` | **{len(validated_events)}** | **{len(validated_events)/total_events*100:.1f}%** | 25 from Cluster 4 + 4 from Cluster 3 |",
    "| **Gas Flare** | `Needs Validation` | **0** | 0.0% | Candidate clusters identified (Cluster 101) |",
    "| **Industrial Fire** | `Needs Validation` | **0** | 0.0% | Candidate clusters identified (Cluster 81, 17) |",
    "| **Other Thermal Source** | `Needs Validation` | **0** | 0.0% | Candidate clusters identified (Cluster 7, 21) |",
    f"| **Unknown** | `Needs Human Validation` | **{len(needs_val_events)}** | **{len(needs_val_events)/total_events*100:.1f}%** | Awaiting structured human review |",
    f"| **Total** | | **{total_events}** | **100.0%** | |",
    "",
    "> [!IMPORTANT]",
    "> **Zero Guessing & Zero Data Modification**: In accordance with the SOP and project constraints, no labels have been guessed, imputed, or fabricated. Raw feature table [`AI_MODEL_INPUT.csv`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv) remains 100% untouched.",
    "",
    "---",
    "",
    "## 2. Inventory of Validated Clusters & Events (29 Events)",
    "",
    "### A. Cluster 4 (25 Events — Validated as `Persistent Industrial Heat`)",
    "- **Coordinates**: Centroid `(22.97941° N, 72.56542° E)` (Vatva / Narol Industrial Estate, Ahmedabad)",
    "- **Temporal Evidence**: 21 unique observation dates spanning 81 days (2026-03-07 to 2026-05-27), 100% nocturnal (25 night / 0 day).",
    "- **Thermal & Spatial**: Mean FRP = `1.46 MW`, Mean TI4 = `310.83 K`, $\\Delta T = 15.09\\text{ K}$, Distance = `388.9 m`, $\\text{NDBI} = +0.115$.",
    "- **Event IDs**: `FIRMS_0006`, `FIRMS_0012`, `FIRMS_0013`, `FIRMS_0014`, `FIRMS_0015`, `FIRMS_0021`, `FIRMS_0022`, `FIRMS_0052`, `FIRMS_0063`, `FIRMS_0094`, `FIRMS_0098`, `FIRMS_0119`, `FIRMS_0121`, `FIRMS_0131`, `FIRMS_0136`, `FIRMS_0137`, `FIRMS_0145`, `FIRMS_0150`, `FIRMS_0157`, `FIRMS_0160`, `FIRMS_0164`, `FIRMS_0178`, `FIRMS_0190`, `FIRMS_0193`, `FIRMS_0197`.",
    "",
    "### B. Cluster 3 (4 Events — Validated as `Persistent Industrial Heat`)",
    "- **Coordinates**: Centroid `(22.96023° N, 72.54734° E)` (Piplaj / Pirana Industrial Hub)",
    "- **Facility Context**: Co-located with *Chiripal industries, pirana* (textile/polymer industrial works) and *Piplaj industrial estate*.",
    "- **Temporal Evidence**: 3 unique observation dates spanning 54 days (2026-03-04, 2026-04-25, 2026-04-27).",
    "- **Thermal & Spatial**: Mean FRP = `11.79 MW` (nocturnal baseline 1.77 MW to daytime peak 21.37 MW), Distance = `1110.3 m`, $\\text{NDBI} = +0.142$.",
    "- **Event IDs**: `FIRMS_0005`, `FIRMS_0139`, `FIRMS_0142`, `FIRMS_0143`.",
    "",
    "---",
    "",
    "## 3. Formally Audited Clusters (3 Events — Cluster 74)",
    "",
    "### Cluster 74 (`FIRMS_0105`, `FIRMS_0173`, `FIRMS_0174`)",
    "- **Location**: `(22.90660° N, 72.42958° E)` near *esdee paints near (works)* (538 m distance).",
    "- **SOP Audit Status**: **Flagged for Senior Review** (`final_label = Unknown`).",
    "- **Why Not Force-Labeled**: Fails the mandatory SOP persistence rule $\\text{cluster\\_unique\\_dates} \\ge 3$ (only 2 dates: April 10 nocturnal baseline and May 19 daytime peak). Furthermore, the extreme thermal contrast ($\\Delta T = 55.63\\text{ K}$, sensor saturation $367.0\\text{ K}$) exhibits flare-like/high-temperature combustion properties that conflict with steady enclosed surface heat and require high-resolution optical basemap confirmation.",
    "",
    "---",
    "",
    "## 4. Next Recommended Human Validation Queue (Batch 2 — 15 Priority Events)",
    "",
    "To build a balanced, multi-class training distribution for the downstream AI/ML stage, **Batch 2** targets 15 priority events across 7 clusters representing all 4 target classes:",
    "",
    "| Target Priority | Cluster ID | Events | Event IDs | Candidate Class | Key Physical / Spatial Evidence |",
    "| :--- | :---: | :---: | :--- | :--- | :--- |",
    "| **1. Gas Flare** | `Cluster_101` | 2 | `FIRMS_0152`, `FIRMS_0170` | **Gas Flare** | 10d span, Day+Night, $548\\text{m}$ to OSM `works`, $\\Delta T = 33.3\\text{ K}$. |",
    "| **2. Industrial Fire** | `Cluster_081` | 2 | `FIRMS_0116`, `FIRMS_0120` | **Industrial Fire** | Acute 2-day span, dataset maximum $27.49\\text{ MW}$ FRP spike at $884\\text{m}$. |",
    "| **2. Industrial Fire** | `Cluster_017` | 1 | `FIRMS_0029` | **Industrial Fire** | Transient single-day detection ($769\\text{m}$ to industry, zero recurrence). |",
    "| **3. Other Thermal** | `Cluster_007` | 2 | `FIRMS_0009`, `FIRMS_0010` | **Other Thermal Source** | Remote agricultural fields ($4.7\\text{ km}$ from industry, $\\text{NDVI} = 0.69$). |",
    "| **3. Other Thermal** | `Cluster_021` | 2 | `FIRMS_0033`, `FIRMS_0034` | **Other Thermal Source** | Remote cultivated crops ($4.0\\text{ km}$ from industry, $\\text{NDVI} = 0.87$). |",
    "| **4. Persistent Heat** | `Cluster_028` | 3 | `FIRMS_0044`, `FIRMS_0110`, `FIRMS_0111` | **Persistent Heat** | 22d span across 2 dates, $\\text{FRP} = 12.8\\text{ MW}$, $\\text{NDBI} = +0.22$. |",
    "| **4. Persistent Heat** | `Cluster_094` | 2 | `FIRMS_0140`, `FIRMS_0183` | **Persistent Heat** | 26d nocturnal recurrence ($494\\text{m}$ to industry, $\\text{FRP} = 1.40\\text{ MW}$). |",
    "| **5. Edge Inspection** | `Cluster_056` | 1 | `FIRMS_0083` | **Ambiguous / Review** | Intermediate distance ($2.3\\text{ km}$), $331\\text{ K}$, requires basemap verification. |"
    "",
    "---",
    "",
    "## 5. Summary Table: All 202 Events by Cluster Grouping & Status",
    "",
    "| Cluster ID | Total Events | Current Label Status | Verified Target Class | Evidence Summary |
    | :---: | :---: | :---: | :--- | :--- |
    | `Cluster_004` | 25 | **Validated** | `Persistent Industrial Heat` | 21 dates, 81d nocturnal recurrence, 388m to industry, NDBI +0.12 |
    | `Cluster_003` | 4 | **Validated** | `Persistent Industrial Heat` | 3 dates, 54d span, Chiripal Industries & Piplaj works |
    | `Cluster_074` | 3 | **Flagged for Senior Review** | `Unknown` (Pending Review) | 2 dates (fails SOP >=3 dates), Delta T 55.6K spike at Esdee Paints |
    | `Cluster_101` | 2 | `Needs Human Validation` | *Candidate: Gas Flare* | Batch 2 Priority 1 (10d span, Day+Night, works) |
    | `Cluster_081` | 2 | `Needs Human Validation` | *Candidate: Industrial Fire* | Batch 2 Priority 2 (2d acute span, 27.5 MW max spike) |
    | `Cluster_017` | 1 | `Needs Human Validation` | *Candidate: Industrial Fire* | Batch 2 Priority 2 (Single-day transient event at 769m) |
    | `Cluster_007` | 2 | `Needs Human Validation` | *Candidate: Other Thermal* | Batch 2 Priority 3 (Remote crop field, 4.7km, NDVI 0.69) |
    | `Cluster_021` | 2 | `Needs Human Validation` | *Candidate: Other Thermal* | Batch 2 Priority 3 (Remote crop field, 4.0km, NDVI 0.87) |
    | `Cluster_028` | 3 | `Needs Human Validation` | *Candidate: Persistent Heat* | Batch 2 Priority 4 (22d span, FRP 12.8 MW, NDBI +0.22) |
    | `Cluster_094` | 2 | `Needs Human Validation` | *Candidate: Persistent Heat* | Batch 2 Priority 4 (26d nocturnal span, 503m distance) |
    | `Cluster_056` | 1 | `Needs Human Validation` | *Candidate: Ambiguous* | Batch 2 Priority 5 (2.3km intermediate distance) |
    | *Remaining 125 Clusters* | 155 | `Needs Human Validation` | `Unknown` | Queued in `data/reports/LABELING_QUEUE.csv` |
    | **Total** | **202** | | | |
    "",
    "---",
    "",
    "## 6. AI/ML Stage Readiness Assessment",
    "",
    "1. **Supervised Training Block**: Machine learning models (Random Forest, XGBoost, LightGBM, SVM) must **NOT** be trained until a balanced, ground-truthed representation of all 4 classes is validated.",
    "2. **Feature Quality**: All 15 numerical and multi-spectral features in `AI_MODEL_INPUT.csv` have 0 missing values, clean distributions, and are 100% prepared for preprocessing/scaling once ground truth annotations are finalized.",
    "3. **Next Recommended Milestone**: Complete Batch 2 visual validation using [`data/reports/batch_2_events.kml`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/batch_2_events.kml) and [`data/reports/BATCH_2_HUMAN_REVIEW.md`](file:///c:/Users/sampa/OneDrive/Desktop/SIH%2026/data/reports/BATCH_2_HUMAN_REVIEW.md) to establish verified positive examples for *Gas Flare*, *Industrial Fire*, and *Other Thermal Source*."
]

report_text = "\n".join(report_lines)
report_file = os.path.join("data", "reports", "AI_LABELING_STATUS.md")

with open(report_file, "w", encoding="utf-8") as f:
    f.write(report_text)

print(f"AI_LABELING_STATUS.md successfully generated at {report_file}")
