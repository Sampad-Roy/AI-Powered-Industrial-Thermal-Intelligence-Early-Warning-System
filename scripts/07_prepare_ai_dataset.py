import os
import pandas as pd


# ============================================================
# 1. FILE PATHS
# ============================================================

INPUT_FILE = "outputs/ai_features_final.csv"

HANDOFF_DIR = "outputs/AI_HANDOFF_SAMPAD"

MODEL_FILE = os.path.join(
    HANDOFF_DIR,
    "AI_MODEL_INPUT.csv"
)

METADATA_FILE = os.path.join(
    HANDOFF_DIR,
    "EVENT_METADATA.csv"
)

README_FILE = os.path.join(
    HANDOFF_DIR,
    "README_SAMPAD.txt"
)


# ============================================================
# 2. CREATE HANDOFF DIRECTORY
# ============================================================

os.makedirs(HANDOFF_DIR, exist_ok=True)


# ============================================================
# 3. LOAD FINAL RS/GIS DATASET
# ============================================================

df = pd.read_csv(INPUT_FILE)

print("Loaded:", INPUT_FILE)
print("Rows:", len(df))
print("Columns:", len(df.columns))


# ============================================================
# 4. CREATE EVENT ID
# ============================================================

df.insert(
    0,
    "event_id",
    ["FIRMS_" + str(i + 1).zfill(4)
     for i in range(len(df))]
)


# ============================================================
# 5. AI / ML FEATURES
# ============================================================

model_features = [
    "event_id",

    # FIRMS thermal features
    "bright_ti4",
    "bright_ti5",
    "frp",
    "confidence",
    "scan",
    "track",

    # Temporal observation
    "daynight",

    # OSM industrial proximity
    "nearest_industry_distance_m",
    "industries_within_500m",
    "industries_within_1km",
    "industries_within_2km",

    # Sentinel-2
    "NDVI",
    "NDBI",
    "NDWI"
]


# ============================================================
# 6. CREATE AI MODEL DATASET
# ============================================================

model_df = df[model_features].copy()


# Convert day/night to numerical feature
model_df["daynight"] = (
    model_df["daynight"]
    .astype(str)
    .str.upper()
    .map({
        "D": 1,
        "N": 0,
        "DAY": 1,
        "NIGHT": 0
    })
)


# ============================================================
# 7. CREATE EVENT METADATA
# ============================================================

metadata_features = [
    "event_id",
    "latitude",
    "longitude",
    "acq_date",
    "acq_time",
    "satellite",
    "instrument",
    "nearest_industry_name",
    "nearest_industry_type",
    "nearest_landuse",
    "nearest_man_made",
    "nearest_power",
    "nearest_industry_distance_km"
]

metadata_df = df[
    [c for c in metadata_features if c in df.columns]
].copy()


# ============================================================
# 8. SAVE FILES
# ============================================================

model_df.to_csv(
    MODEL_FILE,
    index=False
)

metadata_df.to_csv(
    METADATA_FILE,
    index=False
)


# ============================================================
# 9. CREATE README
# ============================================================

readme = """
SIH26162 - AI/ML HANDOFF
========================

Project:
AI-Based Detection and Classification of Industrial Fires
and Persistent Thermal Sources Using NASA FIRMS, OSM &
Satellite Data.

Prepared by:
Sourav Kar
RS & GIS Lead

Handoff to:
Sampad Roy
AI/ML Lead


DATASET
=======

AI_MODEL_INPUT.csv
------------------

This file contains the main numerical features recommended
for AI/ML classification.

Number of expected events:
202

Main feature groups:

1. FIRMS thermal features
   - bright_ti4
   - bright_ti5
   - frp
   - confidence
   - scan
   - track

2. Temporal feature
   - daynight

3. Industrial proximity
   - nearest_industry_distance_m
   - industries_within_500m
   - industries_within_1km
   - industries_within_2km

4. Sentinel-2 features
   - NDVI
   - NDBI
   - NDWI


EVENT_METADATA.csv
------------------

This file contains event/location/context information
for interpretation, reporting and dashboard use.

It should NOT be treated as the primary numerical ML
feature table.


IMPORTANT
=========

The current dataset contains FEATURES, not supervised
classification labels.

Required target classes for the AI model:

1. Industrial Fire
2. Gas Flare
3. Persistent Industrial Heat
4. Other Thermal Source

Labels should be created/validated separately by the
AI/ML and Data/Validation team.


RS/GIS PIPELINE COMPLETED
=========================

NASA FIRMS
    ->
OSM industrial context
    ->
Spatial proximity analysis
    ->
Persistence analysis
    ->
Sentinel-2 NDVI/NDBI/NDWI
    ->
AI-ready feature dataset


ORIGINAL DATASET
================

outputs/ai_features_final.csv

The original dataset should be preserved and not modified.
"""


with open(
    README_FILE,
    "w",
    encoding="utf-8"
) as file:
    file.write(readme)


# ============================================================
# 10. FINAL VALIDATION
# ============================================================

print()
print("=" * 60)
print("AI/ML HANDOFF PACKAGE CREATED")
print("=" * 60)

print()
print("AI MODEL INPUT")
print("Rows:", len(model_df))
print("Columns:", len(model_df.columns))

print()
print("MODEL FEATURES:")
for column in model_df.columns:
    print("-", column)

print()
print("MISSING VALUES:")
print(model_df.isna().sum())

print()
print("FILES CREATED:")
print(MODEL_FILE)
print(METADATA_FILE)
print(README_FILE)

print()
print("READY FOR SAMPAD.")