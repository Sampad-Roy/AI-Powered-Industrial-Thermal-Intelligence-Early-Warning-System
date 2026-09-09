import os
import pandas as pd

df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))
selected_clusters = [101, 81, 7, 21, 28, 94, 56, 17]
sub = df[df['cluster_id'].isin(selected_clusters)].sort_values(by=['cluster_id', 'acq_date', 'event_id']).reset_index(drop=True)

for i, r in sub.iterrows():
    print(f"=== Event {i+1}: {r['event_id']} (Cluster {r['cluster_id']}) ===")
    print(f"  Coordinates: {r['latitude']:.5f}, {r['longitude']:.5f}")
    print(f"  Candidate Class: {r['candidate_class']} (Confidence: {r['evidence_confidence']})")
    print(f"  Dates & Time: {r['acq_date']} {r['acq_time']} (Daynight: {r['daynight']})")
    print(f"  Cluster Dates: {r['cluster_unique_dates']} dates, Span: {r['cluster_span_days']} days (Count: {r['cluster_event_count']})")
    print(f"  Thermal: FRP={r['frp']:.2f} MW, TI4={r['bright_ti4']:.2f} K, TI5={r['bright_ti5']:.2f} K, DeltaT={r['delta_ti4_ti5']:.2f} K")
    print(f"  Proximity: {r['nearest_industry_distance_m']:.1f} m (Context: {r['osm_context_summary']})")
    print(f"  Spectral: NDVI={r['NDVI']:.3f}, NDBI={r['NDBI']:.3f}, NDWI={r['NDWI']:.3f}")
