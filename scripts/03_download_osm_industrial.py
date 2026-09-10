import os
import json
import requests
import geopandas as gpd
from shapely.geometry import Point

# ============================================================
# SIH26162 - OPENSTREETMAP INDUSTRIAL DATA
# Study Area: Ahmedabad
# ============================================================

# Ahmedabad bounding box
# south, west, north, east
SOUTH = 22.75
WEST = 72.25
NORTH = 23.25
EAST = 72.85

OUTPUT_FILE = "data/osm/industrial_facilities.geojson"

# Public Overpass API endpoint
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# ============================================================
# OVERPASS QUERY
# ============================================================

query = f"""
[out:json][timeout:180];

(
  nwr["landuse"="industrial"]({SOUTH},{WEST},{NORTH},{EAST});
  nwr["man_made"="works"]({SOUTH},{WEST},{NORTH},{EAST});
  nwr["power"="plant"]({SOUTH},{WEST},{NORTH},{EAST});
  nwr["power"="generator"]({SOUTH},{WEST},{NORTH},{EAST});
  nwr["industrial"]({SOUTH},{WEST},{NORTH},{EAST});
);

out center tags;
"""

print("=" * 65)
print("OPENSTREETMAP - AHMEDABAD INDUSTRIAL DATA")
print("=" * 65)

print("Study area:")
print(f"  South : {SOUTH}")
print(f"  West  : {WEST}")
print(f"  North : {NORTH}")
print(f"  East  : {EAST}")
print()

print("Connecting to OpenStreetMap Overpass API...")

# ============================================================
# REQUEST
# ============================================================

try:
    headers = {
        "User-Agent": "SIH26162-Industrial-Thermal-Intelligence/1.0"
    }

    response = requests.post(
        OVERPASS_URL,
        data={"data": query},
        headers=headers,
        timeout=240
    )

except Exception as e:
    print("ERROR connecting to Overpass API:")
    print(e)
    raise SystemExit(1)
   

# ============================================================
# CHECK RESPONSE
# ============================================================

if response.status_code != 200:

    print("ERROR: Overpass request failed.")
    print("HTTP status:", response.status_code)
    print(response.text[:1000])
    raise SystemExit(1)

# ============================================================
# PARSE JSON
# ============================================================

data = response.json()

elements = data.get("elements", [])

print()
print("SUCCESS!")
print("OSM elements received:", len(elements))

# ============================================================
# CONVERT TO POINT FEATURES
# ============================================================

records = []

for element in elements:

    tags = element.get("tags", {})

    # Node
    if "lat" in element and "lon" in element:

        latitude = element["lat"]
        longitude = element["lon"]

    # Way / Relation
    elif "center" in element:

        latitude = element["center"]["lat"]
        longitude = element["center"]["lon"]

    else:

        continue

    record = {
        "osm_id": element.get("id"),
        "osm_type": element.get("type"),
        "latitude": latitude,
        "longitude": longitude,

        "name": tags.get("name"),
        "industrial": tags.get("industrial"),
        "landuse": tags.get("landuse"),
        "man_made": tags.get("man_made"),
        "power": tags.get("power"),
        "product": tags.get("product"),
        "operator": tags.get("operator"),
        "works": tags.get("works"),
    }

    records.append(record)

# ============================================================
# CREATE GEODATAFRAME
# ============================================================

if not records:

    print("No industrial facilities were found.")
    raise SystemExit(1)

gdf = gpd.GeoDataFrame(
    records,
    geometry=[
        Point(record["longitude"], record["latitude"])
        for record in records
    ],
    crs="EPSG:4326"
)

# ============================================================
# REMOVE DUPLICATES
# ============================================================

gdf = gdf.drop_duplicates(
    subset=["osm_type", "osm_id"]
).reset_index(drop=True)

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

gdf.to_file(
    OUTPUT_FILE,
    driver="GeoJSON"
)

# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 65)
print("OSM DOWNLOAD COMPLETE")
print("=" * 65)

print("Industrial features:", len(gdf))
print("Saved to:", OUTPUT_FILE)

print()
print("Feature categories:")

if "landuse" in gdf.columns:
    print("landuse:")
    print(gdf["landuse"].value_counts(dropna=False).head(10))

if "man_made" in gdf.columns:
    print()
    print("man_made:")
    print(gdf["man_made"].value_counts(dropna=False).head(10))

if "power" in gdf.columns:
    print()
    print("power:")
    print(gdf["power"].value_counts(dropna=False).head(10))

print()
print("First 10 facilities:")
print(
    gdf[
        [
            "osm_id",
            "osm_type",
            "name",
            "industrial",
            "landuse",
            "man_made",
            "power",
            "latitude",
            "longitude",
        ]
    ]
    .head(10)
    .to_string(index=False)
)

print("=" * 65)