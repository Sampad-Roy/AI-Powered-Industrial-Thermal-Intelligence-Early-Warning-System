import os
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# ============================================================
# SIH26162 - FIRMS + OSM SPATIAL MATCHING
# Study Area: Ahmedabad
# ============================================================

FIRMS_FILE = "data/firms/firms_raw.csv"
OSM_FILE = "data/osm/industrial_facilities.geojson"

OUTPUT_FILE = "outputs/firms_osm_spatial_features.csv"

print("=" * 70)
print("SIH26162 - FIRMS + OSM SPATIAL ANALYSIS")
print("=" * 70)

# ============================================================
# LOAD FIRMS
# ============================================================

print()
print("Loading NASA FIRMS data...")

firms = pd.read_csv(FIRMS_FILE)

print("FIRMS records:", len(firms))

# ============================================================
# CREATE FIRMS GEODATAFRAME
# ============================================================

firms_gdf = gpd.GeoDataFrame(
    firms,
    geometry=[
        Point(lon, lat)
        for lon, lat in zip(
            firms["longitude"],
            firms["latitude"]
        )
    ],
    crs="EPSG:4326"
)

# ============================================================
# LOAD OSM
# ============================================================

print()
print("Loading OSM industrial facilities...")

osm = gpd.read_file(OSM_FILE)

print("OSM facilities:", len(osm))

# Make sure CRS matches
osm = osm.to_crs("EPSG:4326")

# ============================================================
# PROJECT TO METRIC CRS
# ============================================================

print()
print("Converting coordinates to metric CRS...")

# UTM Zone 43N covers Ahmedabad
METRIC_CRS = "EPSG:32643"

firms_metric = firms_gdf.to_crs(METRIC_CRS)
osm_metric = osm.to_crs(METRIC_CRS)

# ============================================================
# SPATIAL DISTANCE
# ============================================================

print()
print("Calculating nearest industrial facility...")

nearest = gpd.sjoin_nearest(
    firms_metric,
    osm_metric[
        [
            "osm_id",
            "name",
            "industrial",
            "landuse",
            "man_made",
            "power",
            "geometry"
        ]
    ],
    how="left",
    distance_col="nearest_industry_distance_m"
)

# ============================================================
# COUNT FACILITIES WITHIN DISTANCES
# ============================================================

print("Calculating industrial density around hotspots...")

# Spatial index for faster searches
osm_sindex = osm_metric.sindex

distances = []

for point in firms_metric.geometry:

    # Candidate facilities within 2 km bounding box
    buffer = point.buffer(2000)

    possible = list(
        osm_sindex.query(
            buffer,
            predicate="intersects"
        )
    )

    nearby = osm_metric.iloc[possible]

    if len(nearby) == 0:
        distances.append(
            {
                "industries_within_500m": 0,
                "industries_within_1km": 0,
                "industries_within_2km": 0
            }
        )
        continue

    d = nearby.geometry.distance(point)

    distances.append(
        {
            "industries_within_500m": int((d <= 500).sum()),
            "industries_within_1km": int((d <= 1000).sum()),
            "industries_within_2km": int((d <= 2000).sum())
        }
    )

density_df = pd.DataFrame(distances)

# ============================================================
# COMBINE FEATURES
# ============================================================

nearest = nearest.reset_index(drop=True)

# Remove geometry from output
nearest = nearest.drop(columns=["geometry"])

result = pd.concat(
    [
        nearest,
        density_df
    ],
    axis=1
)

# ============================================================
# RENAME OSM FIELDS
# ============================================================

result = result.rename(
    columns={
        "name": "nearest_industry_name",
        "industrial": "nearest_industry_type",
        "landuse": "nearest_landuse",
        "man_made": "nearest_man_made",
        "power": "nearest_power"
    }
)

# ============================================================
# CONVERT DISTANCE TO KM
# ============================================================

result["nearest_industry_distance_km"] = (
    result["nearest_industry_distance_m"] / 1000
)

# ============================================================
# ROUND VALUES
# ============================================================

result["nearest_industry_distance_m"] = (
    result["nearest_industry_distance_m"].round(2)
)

result["nearest_industry_distance_km"] = (
    result["nearest_industry_distance_km"].round(3)
)

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

result.to_csv(
    OUTPUT_FILE,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("SPATIAL MATCHING COMPLETE")
print("=" * 70)

print("FIRMS hotspots:", len(result))

print(
    "Hotspots with industry within 500 m:",
    (result["industries_within_500m"] > 0).sum()
)

print(
    "Hotspots with industry within 1 km:",
    (result["industries_within_1km"] > 0).sum()
)

print(
    "Hotspots with industry within 2 km:",
    (result["industries_within_2km"] > 0).sum()
)

print()
print("Output saved to:")
print(OUTPUT_FILE)

print()
print("Important spatial features:")

print(
    result[
        [
            "latitude",
            "longitude",
            "acq_date",
            "frp",
            "nearest_industry_name",
            "nearest_industry_type",
            "nearest_industry_distance_m",
            "industries_within_500m",
            "industries_within_1km",
            "industries_within_2km"
        ]
    ]
    .head(10)
    .to_string(index=False)
)

print("=" * 70)