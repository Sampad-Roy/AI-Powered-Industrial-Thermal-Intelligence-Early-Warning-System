import os
import pandas as pd
import numpy as np

# Load datasets
model_input_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")
event_meta_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "EVENT_METADATA.csv")

df_model = pd.read_csv(model_input_path)
df_meta = pd.read_csv(event_meta_path)

# Merge on event_id
merged = pd.merge(df_meta, df_model, on='event_id', how='inner')

# Calculate pairwise spatial distance matrix to analyze cluster-level recurrence & persistence across time
def haversine_vectorized(lats, lons):
    lat_r = np.radians(lats)
    lon_r = np.radians(lons)
    dlat = lat_r[:, None] - lat_r[None, :]
    dlon = lon_r[:, None] - lon_r[None, :]
    a = np.sin(dlat / 2.0)**2 + np.cos(lat_r[:, None]) * np.cos(lat_r[None, :]) * np.sin(dlon / 2.0)**2
    c = 2 * np.arcsin(np.sqrt(np.clip(a, 0, 1)))
    return 6371000.0 * c # meters

dist_matrix = haversine_vectorized(merged['latitude'].values, merged['longitude'].values)

# For each event, compute persistence indicators:
# 1. Total detections within 500m
# 2. Total detections within 1km
# 3. Unique acquisition dates within 500m
# 4. Temporal span (days between first and last detection within 500m)
merged['acq_date_dt'] = pd.to_datetime(merged['acq_date'])

thermal_events_within_500m = []
thermal_events_within_1km = []
unique_dates_within_500m = []
cluster_temporal_span_days = []
cluster_id_list = []

# Simple spatial clustering (DBSCAN-like with 500m radius)
from scipy.sparse.csgraph import connected_components
adj_500m = (dist_matrix <= 500).astype(int)
n_components, labels = connected_components(adj_500m, directed=False)

for i in range(len(merged)):
    mask_500m = dist_matrix[i] <= 500
    mask_1km = dist_matrix[i] <= 1000
    
    n_500 = np.sum(mask_500m) # includes self
    n_1k = np.sum(mask_1km) # includes self
    
    dates_500 = merged.loc[mask_500m, 'acq_date_dt']
    u_dates = dates_500.nunique()
    time_span = (dates_500.max() - dates_500.min()).days if len(dates_500) > 1 else 0
    
    thermal_events_within_500m.append(n_500)
    thermal_events_within_1km.append(n_1k)
    unique_dates_within_500m.append(u_dates)
    cluster_temporal_span_days.append(time_span)

merged['cluster_id'] = labels
merged['cluster_event_count_500m'] = thermal_events_within_500m
merged['cluster_unique_dates_500m'] = unique_dates_within_500m
merged['cluster_span_days_500m'] = cluster_temporal_span_days
merged['cluster_event_count_1km'] = thermal_events_within_1km

# Check persistence categorization:
# Highly persistent: detected on multiple separate dates (>= 3 unique dates or >= 5 events in cluster)
# Recurrent / Intermittent: 2 unique dates
# Single transient detection: 1 detection / 1 date
def get_persistence_summary(row):
    if row['cluster_unique_dates_500m'] >= 4 or row['cluster_event_count_500m'] >= 5:
        return f"High Persistence ({row['cluster_event_count_500m']} detections across {row['cluster_unique_dates_500m']} dates, {row['cluster_span_days_500m']}d span)"
    elif row['cluster_unique_dates_500m'] >= 2 or row['cluster_event_count_500m'] >= 2:
        return f"Moderate Persistence ({row['cluster_event_count_500m']} detections across {row['cluster_unique_dates_500m']} dates, {row['cluster_span_days_500m']}d span)"
    else:
        return "Transient / Single Occurrence (1 detection)"

merged['persistence_summary'] = merged.apply(get_persistence_summary, axis=1)

# Format time nicely (e.g. 0859 -> "08:59", 2030 -> "20:30")
def format_time(t):
    s = str(t).zfill(4)
    return f"{s[:2]}:{s[2:]}"

merged['acq_time_hhmm'] = merged['acq_time'].apply(format_time)

# Context summary
def get_context_summary(row):
    items = []
    if pd.notna(row['nearest_industry_name']) and str(row['nearest_industry_name']).strip():
        items.append(f"Name: {row['nearest_industry_name']}")
    if pd.notna(row['nearest_industry_type']) and str(row['nearest_industry_type']).strip():
        items.append(f"Type: {row['nearest_industry_type']}")
    if pd.notna(row['nearest_landuse']) and str(row['nearest_landuse']).strip():
        items.append(f"Landuse: {row['nearest_landuse']}")
    if pd.notna(row['nearest_man_made']) and str(row['nearest_man_made']).strip():
        items.append(f"Man-made: {row['nearest_man_made']}")
    if pd.notna(row['nearest_power']) and str(row['nearest_power']).strip():
        items.append(f"Power: {row['nearest_power']}")
    if not items:
        return "No specific OSM tag recorded (Distance: " + f"{row['nearest_industry_distance_m']:.1f}m)"
    return "; ".join(items)

merged['context_summary'] = merged.apply(get_context_summary, axis=1)

# Format table columns strictly as required:
# - event_id
# - latitude
# - longitude
# - acquisition date/time if available
# - FIRMS thermal features
# - confidence
# - nearest industry distance
# - industrial counts
# - NDVI
# - NDBI
# - NDWI
# - persistence-related information available in EVENT_METADATA.csv
# - industrial/context information available in EVENT_METADATA.csv

export_cols = [
    'event_id',
    'latitude',
    'longitude',
    'acq_date',
    'acq_time_hhmm',
    'satellite',
    'instrument',
    'bright_ti4',
    'bright_ti5',
    'frp',
    'confidence',
    'scan',
    'track',
    'daynight',
    'nearest_industry_distance_m',
    'industries_within_500m',
    'industries_within_1km',
    'industries_within_2km',
    'NDVI',
    'NDBI',
    'NDWI',
    'persistence_summary',
    'cluster_id',
    'cluster_event_count_500m',
    'cluster_unique_dates_500m',
    'cluster_span_days_500m',
    'nearest_industry_name',
    'nearest_industry_type',
    'nearest_landuse',
    'nearest_man_made',
    'nearest_power',
    'context_summary'
]

# Create validation table
validation_table = merged[export_cols]

# Save table
output_table_path = os.path.join("data", "reports", "label_validation_table.csv")
validation_table.to_csv(output_table_path, index=False)
print(f"Validation table with {len(validation_table)} rows written to {output_table_path}")

# Print summary diagnostics
print("\nPersistence summary value counts:")
print(validation_table['persistence_summary'].value_counts())

print("\nNumber of spatial clusters formed at 500m radius:", n_components)
cluster_sizes = validation_table['cluster_id'].value_counts()
print("Largest cluster sizes:\n", cluster_sizes.head(10))

print("\nOSM tags availability:")
print("- nearest_industry_name non-null:", validation_table['nearest_industry_name'].notnull().sum())
print("- nearest_industry_type non-null:", validation_table['nearest_industry_type'].notnull().sum())
print("- nearest_landuse non-null:", validation_table['nearest_landuse'].notnull().sum())
print("- nearest_man_made non-null:", validation_table['nearest_man_made'].notnull().sum())
print("- nearest_power non-null:", validation_table['nearest_power'].notnull().sum())
