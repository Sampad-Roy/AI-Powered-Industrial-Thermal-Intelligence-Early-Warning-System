import os
import requests
import pandas as pd
from io import StringIO
from datetime import datetime, timedelta

# ============================================================
# SIH26162 - NASA FIRMS HISTORICAL DATA DOWNLOADER
# Study Area: Ahmedabad
# Product: VIIRS NOAA-20 Standard Processing
# Period: March 1, 2026 - May 31, 2026
# ============================================================

MAP_KEY = os.getenv("FIRMS_MAP_KEY")

if not MAP_KEY:
    raise ValueError(
        "FIRMS_MAP_KEY is not set. "
        "Set your NASA FIRMS MAP_KEY in the terminal first."
    )

# Ahmedabad bounding box
AREA = "72.25,22.75,72.85,23.25"

# Historical scientific-quality product
SOURCE = "VIIRS_NOAA20_SP"

# FIRMS API maximum request size
DAY_RANGE = 5

# Historical period
START_DATE = datetime(2026, 3, 1)
END_DATE = datetime(2026, 5, 31)

# Final output
OUTPUT_FILE = "data/firms/firms_raw.csv"

# ============================================================
# INFORMATION
# ============================================================

print("=" * 65)
print("NASA FIRMS - AHMEDABAD HISTORICAL DATA DOWNLOAD")
print("=" * 65)
print(f"Satellite product : {SOURCE}")
print("Study area        : Ahmedabad")
print(f"Bounding box      : {AREA}")
print(f"Start date        : {START_DATE.date()}")
print(f"End date          : {END_DATE.date()}")
print(f"Request size      : {DAY_RANGE} days")
print()

# ============================================================
# DOWNLOAD IN 5-DAY CHUNKS
# ============================================================

all_data = []

current_date = START_DATE
request_number = 0

while current_date <= END_DATE:

    request_number += 1

    print(
        f"Request {request_number}: "
        f"{current_date.date()} "
        f"to "
        f"{min(current_date + timedelta(days=DAY_RANGE - 1), END_DATE).date()}"
    )

    url = (
        "https://firms.modaps.eosdis.nasa.gov/api/area/csv/"
        f"{MAP_KEY}/{SOURCE}/{AREA}/{DAY_RANGE}/"
        f"{current_date.strftime('%Y-%m-%d')}"
    )

    try:
        response = requests.get(url, timeout=120)

        if response.status_code != 200:
            print(
                f"  ERROR: HTTP {response.status_code}"
            )
            print(
                f"  {response.text[:300]}"
            )
        else:
            df = pd.read_csv(StringIO(response.text))

            print(f"  Records: {len(df)}")

            if not df.empty:
                all_data.append(df)

    except Exception as e:
        print(f"  ERROR: {e}")

    current_date += timedelta(days=DAY_RANGE)

# ============================================================
# COMBINE RESULTS
# ============================================================

print()
print("=" * 65)
print("COMBINING DATA")
print("=" * 65)

if not all_data:
    print("No FIRMS records were downloaded.")
    raise SystemExit(1)

df_final = pd.concat(all_data, ignore_index=True)

print(f"Records before duplicate removal: {len(df_final)}")

# ============================================================
# REMOVE DUPLICATES
# ============================================================

df_final = df_final.drop_duplicates()

print(f"Records after duplicate removal : {len(df_final)}")

# ============================================================
# SORT BY DATE AND TIME
# ============================================================

if "acq_date" in df_final.columns and "acq_time" in df_final.columns:
    df_final = df_final.sort_values(
        by=["acq_date", "acq_time"]
    ).reset_index(drop=True)

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

df_final.to_csv(
    OUTPUT_FILE,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 65)
print("SUCCESS!")
print("=" * 65)

print(f"Total records : {len(df_final)}")
print(f"Saved to      : {OUTPUT_FILE}")

print()
print("Columns:")

for column in df_final.columns:
    print(f" - {column}")

print()
print("Records by acquisition date:")

if "acq_date" in df_final.columns:
    print(
        df_final["acq_date"]
        .value_counts()
        .sort_index()
    )

print()
print("First 10 records:")
print(df_final.head(10).to_string(index=False))

print("=" * 65)