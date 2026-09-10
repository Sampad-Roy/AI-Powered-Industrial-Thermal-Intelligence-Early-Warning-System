import os
import pandas as pd
import numpy as np

# ============================================================
# SIH26162 - PERSISTENCE ANALYSIS
# Study Area: Ahmedabad
# ============================================================

INPUT_FILE = "outputs/firms_osm_spatial_features.csv"

OUTPUT_FILE = "outputs/persistent_sources.csv"

# Distance used to group nearby FIRMS detections
# ~1 km is suitable for an initial satellite hotspot analysis
GRID_SIZE = 0.01

# Minimum number of different detection dates
# for a location to be considered persistent
MIN_DETECTION_DAYS = 3


print("=" * 70)
print("SIH26162 - THERMAL SOURCE PERSISTENCE ANALYSIS")
print("=" * 70)

# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading spatial FIRMS dataset...")

df = pd.read_csv(INPUT_FILE)

print("Input records:", len(df))

# ============================================================
# CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "latitude",
    "longitude",
    "acq_date",
    "frp"
]

missing = [c for c in required_columns if c not in df.columns]

if missing:
    print("ERROR: Missing required columns:")
    for c in missing:
        print(" -", c)
    raise SystemExit(1)

# ============================================================
# CLEAN DATA
# ============================================================

df = df.copy()

df["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
df["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
df["frp"] = pd.to_numeric(df["frp"], errors="coerce")

df["acq_date"] = pd.to_datetime(
    df["acq_date"],
    errors="coerce"
)

df = df.dropna(
    subset=[
        "latitude",
        "longitude",
        "acq_date"
    ]
)

print("Valid records:", len(df))

# ============================================================
# CREATE SPATIAL GRID
# ============================================================
#
# Nearby satellite detections are grouped into approximately
# 1 km spatial cells.
#
# 0.01 degree latitude/longitude is roughly ~1 km.
# This is an initial prototype method.
# ============================================================

df["grid_lat"] = (
    np.floor(df["latitude"] / GRID_SIZE)
    * GRID_SIZE
)

df["grid_lon"] = (
    np.floor(df["longitude"] / GRID_SIZE)
    * GRID_SIZE
)

# Round to avoid floating-point problems
df["grid_lat"] = df["grid_lat"].round(4)
df["grid_lon"] = df["grid_lon"].round(4)

# ============================================================
# GROUP DETECTIONS
# ============================================================

print("\nGrouping repeated thermal detections...")

group_columns = [
    "grid_lat",
    "grid_lon"
]

grouped = (
    df.groupby(group_columns)
    .agg(
        first_detection=("acq_date", "min"),
        last_detection=("acq_date", "max"),
        total_detections=("acq_date", "count"),
        detection_days=("acq_date", "nunique"),
        average_frp=("frp", "mean"),
        maximum_frp=("frp", "max"),
        latitude=("latitude", "mean"),
        longitude=("longitude", "mean")
    )
    .reset_index()
)

# ============================================================
# OBSERVATION PERIOD
# ============================================================

grouped["observation_period_days"] = (
    grouped["last_detection"]
    - grouped["first_detection"]
).dt.days + 1

# ============================================================
# DETECTION FREQUENCY
# ============================================================

grouped["detection_frequency"] = (
    grouped["detection_days"]
    / grouped["observation_period_days"]
)

# ============================================================
# PERSISTENCE CLASSIFICATION
# ============================================================

grouped["persistence"] = np.where(
    grouped["detection_days"] >= MIN_DETECTION_DAYS,
    "Persistent",
    "Non-Persistent"
)

# ============================================================
# SORT BY PERSISTENCE
# ============================================================

grouped = grouped.sort_values(
    by=[
        "detection_days",
        "maximum_frp"
    ],
    ascending=[
        False,
        False
    ]
)

# ============================================================
# SAVE ALL GROUPED SOURCES
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

grouped.to_csv(
    OUTPUT_FILE,
    index=False
)

# ============================================================
# SAVE ONLY PERSISTENT SOURCES
# ============================================================

persistent = grouped[
    grouped["persistence"] == "Persistent"
].copy()

PERSISTENT_FILE = "outputs/persistent_sources_only.csv"

persistent.to_csv(
    PERSISTENT_FILE,
    index=False
)

# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("PERSISTENCE ANALYSIS COMPLETE")
print("=" * 70)

print("\nTotal spatial source groups:", len(grouped))

print(
    "Persistent source groups:",
    len(persistent)
)

print(
    "Non-persistent source groups:",
    len(grouped) - len(persistent)
)

print(
    "\nPersistence threshold:",
    f"{MIN_DETECTION_DAYS} different detection days"
)

print(
    "Spatial grouping:",
    f"{GRID_SIZE} degree grid (~1 km)"
)

print("\nDate range:")

print(
    grouped["first_detection"].min().date(),
    "to",
    grouped["last_detection"].max().date()
)

print("\nTop persistent sources:")

display_columns = [
    "latitude",
    "longitude",
    "first_detection",
    "last_detection",
    "total_detections",
    "detection_days",
    "average_frp",
    "maximum_frp",
    "detection_frequency",
    "persistence"
]

print(
    persistent[display_columns]
    .head(20)
    .to_string(index=False)
)

print("\nSaved files:")

print(
    " -",
    OUTPUT_FILE
)

print(
    " -",
    PERSISTENT_FILE
)

print("=" * 70)