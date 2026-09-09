import os
import requests
import pandas as pd
from io import StringIO

# ==========================================
# SIH26162 - NASA FIRMS DATA DOWNLOAD
# Study Area: Ahmedabad
# ==========================================

# NASA FIRMS MAP_KEY is stored as an environment variable
MAP_KEY = os.getenv("FIRMS_MAP_KEY")

if not MAP_KEY:
    raise ValueError(
        "FIRMS_MAP_KEY is not set. "
        "Set your NASA FIRMS MAP_KEY in the terminal first."
    )

# Ahmedabad study area
# west, south, east, north
AREA = "72.25,22.75,72.85,23.25"

# NASA VIIRS NOAA-21 Near Real-Time product
SOURCE = "VIIRS_NOAA20_SP"

# Start with 5 days for testing
DAY_RANGE = 5

# Output file
OUTPUT_FILE = "data/firms/firms_raw_noaa20_sp_5day.csv"

# ==========================================
# BUILD FIRMS API URL
# ==========================================

START_DATE = "2026-04-01"

url = (
    f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
    f"{MAP_KEY}/{SOURCE}/{AREA}/{DAY_RANGE}/{START_DATE}"
)

print("=" * 60)
print("NASA FIRMS - AHMEDABAD DATA DOWNLOAD")
print("=" * 60)
print(f"Satellite product : {SOURCE}")
print(f"Study area        : Ahmedabad")
print(f"Bounding box      : {AREA}")
print(f"Days requested    : {DAY_RANGE}")
print()

# ==========================================
# DOWNLOAD
# ==========================================

print("Connecting to NASA FIRMS...")

response = requests.get(url, timeout=120)

if response.status_code != 200:
    print("ERROR: FIRMS request failed.")
    print("HTTP status:", response.status_code)
    print(response.text[:500])
    raise SystemExit(1)

# ==========================================
# READ DATA
# ==========================================

df = pd.read_csv(StringIO(response.text))

# Create output folder if needed
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

# Save CSV
df.to_csv(OUTPUT_FILE, index=False)

# ==========================================
# RESULTS
# ==========================================

print()
print("SUCCESS!")
print("-" * 60)
print("Records downloaded:", len(df))
print("Saved to:", OUTPUT_FILE)
print()

print("Columns:")
for column in df.columns:
    print(" -", column)

print()
print("First 5 records:")
print(df.head())

print("=" * 60)