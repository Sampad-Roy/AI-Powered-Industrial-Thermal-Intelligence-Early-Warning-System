import os
import pandas as pd
import numpy as np

# Load HUMAN_LABELING_SHEET.csv
input_csv = os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv")
df = pd.read_csv(input_csv)

# Define priority score for confidence tier:
# Tier 1: High confidence (e.g. Persistent Industrial Heat with 25 events, remote rural burns with high NDVI)
# Tier 2: Medium confidence
# Tier 3: Low confidence
# Tier 4: Ambiguous
confidence_tier_map = {
    'High': 1,
    'Medium': 2,
    'Low': 3,
    'Ambiguous': 4
}

# Determine cluster-level priority so entire clusters stay grouped together at the appropriate priority tier
cluster_tiers = {}
cluster_sizes = {}
for cid, g in df.groupby('cluster_id'):
    # Minimum tier in the cluster determines the cluster priority
    tiers = [confidence_tier_map.get(c, 4) for c in g['evidence_confidence']]
    cluster_tiers[cid] = min(tiers)
    cluster_sizes[cid] = len(g)

df['cluster_priority_tier'] = df['cluster_id'].map(cluster_tiers)
df['cluster_size'] = df['cluster_id'].map(cluster_sizes)
df['event_priority_tier'] = df['evidence_confidence'].map(lambda x: confidence_tier_map.get(x, 4))

# Sort order:
# 1. cluster_priority_tier (1: High -> 2: Medium -> 3: Low -> 4: Ambiguous)
# 2. -cluster_size (Largest clusters first within each tier, e.g. Cluster 4 with 25 events first)
# 3. cluster_id (Keep cluster items contiguous)
# 4. acq_date / event_id (Chronological order within cluster)
sorted_df = df.sort_values(
    by=['cluster_priority_tier', 'cluster_size', 'cluster_id', 'acq_date', 'event_id'],
    ascending=[True, False, True, True, True]
).reset_index(drop=True)

# Add queue_priority_rank
sorted_df['queue_rank'] = range(1, len(sorted_df) + 1)

# Format required export columns:
# event_id, cluster_id, candidate_class, evidence_confidence, candidate_evidence_summary, validation_action_required, latitude, longitude
export_cols = [
    'queue_rank',
    'event_id',
    'cluster_id',
    'candidate_class',
    'evidence_confidence',
    'candidate_evidence_summary',
    'validation_action_required',
    'latitude',
    'longitude'
]

queue_table = sorted_df[export_cols]

output_path = os.path.join("data", "reports", "LABELING_QUEUE.csv")
queue_table.to_csv(output_path, index=False)

print(f"LABELING_QUEUE.csv successfully created with {len(queue_table)} records at {output_path}")

# Print queue diagnostics
print("\nQueue Breakdown by Confidence Tier:")
print(sorted_df['evidence_confidence'].value_counts())

print("\nFirst 15 records in priority queue:")
for idx, r in queue_table.head(15).iterrows():
    print(f"Rank {r['queue_rank']:3d} | {r['event_id']} | Cluster {r['cluster_id']:3d} | {r['candidate_class']:28s} | {r['evidence_confidence']:9s} | ({r['latitude']:.4f}, {r['longitude']:.4f})")

print("\nLast 10 records in priority queue (Ambiguous):")
for idx, r in queue_table.tail(10).iterrows():
    print(f"Rank {r['queue_rank']:3d} | {r['event_id']} | Cluster {r['cluster_id']:3d} | {r['candidate_class']:28s} | {r['evidence_confidence']:9s} | ({r['latitude']:.4f}, {r['longitude']:.4f})")
