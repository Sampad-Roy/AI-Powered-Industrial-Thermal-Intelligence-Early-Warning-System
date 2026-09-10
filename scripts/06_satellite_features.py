import os
import time
import pandas as pd
import ee


# ============================================================
# 1. EARTH ENGINE SETUP
# ============================================================

PROJECT_ID = "sourav-ee-precipitation2020-24"

ee.Initialize(project=PROJECT_ID)

print("Earth Engine initialized successfully.")


# ============================================================
# 2. FILE PATHS
# ============================================================

INPUT_FILE = "outputs/firms_osm_spatial_features.csv"
OUTPUT_FILE = "outputs/ai_features_final.csv"


# ============================================================
# 3. LOAD FIRMS + OSM DATA
# ============================================================

df = pd.read_csv(INPUT_FILE)

print(f"Input rows: {len(df)}")


# ============================================================
# 4. SENTINEL-2 CLOUD MASK
# ============================================================

def mask_sentinel2(image):
    """
    Mask clouds, cloud shadows and cirrus using Sentinel-2 SCL.
    """

    scl = image.select("SCL")

    mask = (
        scl.neq(3)     # Cloud shadow
        .And(scl.neq(8))   # Cloud medium probability
        .And(scl.neq(9))   # Cloud high probability
        .And(scl.neq(10))  # Cirrus
        .And(scl.neq(11))  # Snow/ice
    )

    return image.updateMask(mask)


# ============================================================
# 5. CREATE SPECTRAL INDICES
# ============================================================

def add_indices(image):

    ndvi = image.normalizedDifference(
        ["B8", "B4"]
    ).rename("NDVI")

    ndbi = image.normalizedDifference(
        ["B11", "B8"]
    ).rename("NDBI")

    ndwi = image.normalizedDifference(
        ["B3", "B8"]
    ).rename("NDWI")

    return image.addBands([
        ndvi,
        ndbi,
        ndwi
    ])


# ============================================================
# 6. GET SENTINEL-2 IMAGE
# ============================================================

def get_sentinel_image(latitude, longitude, date):

    point = ee.Geometry.Point([
        float(longitude),
        float(latitude)
    ])

    event_date = pd.to_datetime(date)

    # Search approximately ±15 days around FIRMS detection
    start_date = (
        event_date - pd.Timedelta(days=15)
    ).strftime("%Y-%m-%d")

    end_date = (
        event_date + pd.Timedelta(days=16)
    ).strftime("%Y-%m-%d")

    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(point)
        .filterDate(start_date, end_date)
        .filter(
            ee.Filter.lt(
                "CLOUDY_PIXEL_PERCENTAGE",
                40
            )
        )
        .map(mask_sentinel2)
        .map(add_indices)
        .sort("CLOUDY_PIXEL_PERCENTAGE")
    )

    image = collection.first()

    return image, point


# ============================================================
# 7. EXTRACT NDVI / NDBI / NDWI
# ============================================================

def extract_indices(latitude, longitude, date):

    try:

        image, point = get_sentinel_image(
            latitude,
            longitude,
            date
        )

        # Check whether an image exists
        image_info = image.getInfo()

        if image_info is None:
            return None, None, None

        values = (
            image
            .select([
                "NDVI",
                "NDBI",
                "NDWI"
            ])
            .reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=20,
                bestEffort=True,
                maxPixels=1000000
            )
            .getInfo()
        )

        ndvi = values.get("NDVI")
        ndbi = values.get("NDBI")
        ndwi = values.get("NDWI")

        return ndvi, ndbi, ndwi

    except Exception as error:

        print(
            f"Satellite error at "
            f"{latitude}, {longitude}, {date}: "
            f"{error}"
        )

        return None, None, None


# ============================================================
# 8. PROCESS ALL FIRMS EVENTS
# ============================================================

ndvi_values = []
ndbi_values = []
ndwi_values = []

total = len(df)

print()
print("Starting Sentinel-2 feature extraction...")
print(f"Total events: {total}")
print()


for index, row in df.iterrows():

    latitude = row["latitude"]
    longitude = row["longitude"]
    date = row["acq_date"]

    print(
        f"[{index + 1}/{total}] "
        f"{date} | "
        f"{latitude:.5f}, {longitude:.5f}"
    )

    ndvi, ndbi, ndwi = extract_indices(
        latitude,
        longitude,
        date
    )

    ndvi_values.append(ndvi)
    ndbi_values.append(ndbi)
    ndwi_values.append(ndwi)

    # Small delay to avoid sending requests too quickly
    time.sleep(0.2)


# ============================================================
# 9. ADD SATELLITE FEATURES
# ============================================================

df["NDVI"] = ndvi_values
df["NDBI"] = ndbi_values
df["NDWI"] = ndwi_values


# ============================================================
# 10. SAVE FINAL AI DATASET
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)


# ============================================================
# 11. VALIDATION
# ============================================================

print()
print("=" * 60)
print("SATELLITE FEATURE EXTRACTION COMPLETE")
print("=" * 60)

print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")

print()
print("Satellite columns:")

print(
    df[
        [
            "NDVI",
            "NDBI",
            "NDWI"
        ]
    ].describe()
)

print()
print(f"Output saved to:")
print(OUTPUT_FILE)

print()
print("DONE.")