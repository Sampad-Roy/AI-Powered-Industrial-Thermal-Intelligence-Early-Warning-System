import os
import pandas as pd
import numpy as np

# Load validation table
val_path = os.path.join("data", "reports", "label_validation_table.csv")
df = pd.read_csv(val_path)
df['acq_date_dt'] = pd.to_datetime(df['acq_date'])

# Cluster statistics lookup
cluster_info = {}
for cid, g in df.groupby('cluster_id'):
    n_events = len(g)
    u_dates = g['acq_date'].nunique()
    span_days = (g['acq_date_dt'].max() - g['acq_date_dt'].min()).days if n_events > 1 else 0
    mean_dist = g['nearest_industry_distance_m'].mean()
    mean_frp = g['frp'].mean()
    max_frp = g['frp'].max()
    mean_ti4 = g['bright_ti4'].mean()
    mean_ti5 = g['bright_ti5'].mean()
    delta_t = mean_ti4 - mean_ti5
    day_cnt = (g['daynight'] == 1).sum()
    night_cnt = (g['daynight'] == 0).sum()
    mean_ndvi = g['NDVI'].mean()
    mean_ndbi = g['NDBI'].mean()
    mean_ndwi = g['NDWI'].mean()
    
    context_items = set()
    for ctx in g['context_summary']:
        if pd.notna(ctx) and str(ctx).strip():
            context_items.add(str(ctx).strip())
    context_str = "; ".join(sorted(context_items)) if context_items else "No specific OSM tag"
    
    cluster_info[cid] = {
        'n_events': n_events,
        'u_dates': u_dates,
        'span_days': span_days,
        'mean_dist': mean_dist,
        'mean_frp': mean_frp,
        'max_frp': max_frp,
        'mean_ti4': mean_ti4,
        'mean_ti5': mean_ti5,
        'delta_t': delta_t,
        'day_cnt': day_cnt,
        'night_cnt': night_cnt,
        'mean_ndvi': mean_ndvi,
        'mean_ndbi': mean_ndbi,
        'mean_ndwi': mean_ndwi,
        'context_str': context_str
    }

# Build rows for HUMAN_LABELING_SHEET.csv
rows = []
for idx, row in df.iterrows():
    cid = row['cluster_id']
    cdata = cluster_info[cid]
    
    ti4 = row['bright_ti4']
    ti5 = row['bright_ti5']
    d_ti = round(ti4 - ti5, 2)
    frp = row['frp']
    dist = row['nearest_industry_distance_m']
    ind_500 = row['industries_within_500m']
    ind_1k = row['industries_within_1km']
    ind_2k = row['industries_within_2km']
    ndvi = row['NDVI']
    ndbi = row['NDBI']
    ndwi = row['NDWI']
    dn = row['daynight']
    conf = row['confidence']
    u_dates = cdata['u_dates']
    span = cdata['span_days']
    n_ev = cdata['n_events']
    ctx = row['context_summary']
    ctx_str = str(ctx) if pd.notna(ctx) else ""
    
    # Evidence categorization logic per event
    # Group A: Persistent Industrial Heat
    if (cid == 4) or (u_dates >= 3 and span >= 15 and dist <= 1500) or (u_dates >= 2 and dist <= 1200 and ndbi > 0.05):
        cand_class = "Persistent Industrial Heat"
        evidence = f"Multi-date recurrence ({u_dates} dates over {span}d span in cluster), inside/adjacent to industrial zone (dist {dist:.0f}m, NDBI {ndbi:.2f})."
        ev_conf = "High" if (u_dates >= 4 or cid == 4) else "Medium"
        action = "Confirm industrial facility boundary and continuous operations via satellite basemap."
        
    # Group B: Gas Flare
    elif (dn == 0 and d_ti >= 25.0 and dist <= 1500 and ('works' in ctx_str.lower() or 'power' in ctx_str.lower() or 'generator' in ctx_str.lower() or 'resin' in ctx_str.lower() or frp > 5.0)) or (cid in [74, 101]):
        cand_class = "Gas Flare"
        evidence = f"Strong thermal contrast (Delta T = {d_ti:.1f}K), located at specialized industrial works/power/chemical site ({dist:.0f}m)."
        ev_conf = "Medium"
        action = "Verify presence of elevated flare stack, chemical refinery, or burner unit via high-resolution imagery."
        
    # Group C: Industrial Fire
    elif (dist <= 1000 and u_dates <= 2 and span <= 2 and (frp >= 3.0 or ti4 >= 335.0) and ndbi > 0):
        cand_class = "Industrial Fire"
        evidence = f"Acute transient detection (span {span}d) with elevated thermal emission (FRP {frp:.2f}MW, TI4 {ti4:.1f}K) inside industrial zone ({dist:.0f}m, NDBI {ndbi:.2f})."
        ev_conf = "Medium" if (frp >= 5.0 and dist <= 500) else "Low"
        action = "Cross-reference with local municipal fire dispatch logs or optical smoke plume evidence."
        
    # Group D: Other Thermal Source
    elif (dist >= 2500 and ind_1k == 0 and ind_2k <= 1 and (ndvi >= 0.20 or ndbi < 0.05) and u_dates <= 2 and span <= 2):
        cand_class = "Other Thermal Source"
        evidence = f"Remote from industrial infrastructure ({dist:.0f}m, 0 industries in 1km), rural/agricultural spectral profile (NDVI {ndvi:.2f}, NDBI {ndbi:.2f}), single/episodic burn."
        ev_conf = "High" if (dist >= 4000 and ndvi >= 0.30) else "Medium"
        action = "Verify agricultural plot boundary or open field context on satellite imagery."
        
    # Group E: Ambiguous
    else:
        cand_class = "Ambiguous (Review Required)"
        evidence = f"Intermediate proximity ({dist:.0f}m) or mixed spectral signals (NDVI {ndvi:.2f}, NDBI {ndbi:.2f}, FRP {frp:.2f}MW)."
        ev_conf = "Ambiguous"
        action = "Perform comprehensive multi-temporal optical imagery inspection (Sentinel-2 / Google Earth) to determine site activity."

    rows.append({
        'event_id': row['event_id'],
        'cluster_id': cid,
        'acq_date': row['acq_date'],
        'acq_time': row['acq_time_hhmm'],
        'satellite': row['satellite'],
        'instrument': row['instrument'],
        'latitude': row['latitude'],
        'longitude': row['longitude'],
        'daynight': dn,
        'bright_ti4': ti4,
        'bright_ti5': ti5,
        'delta_ti4_ti5': d_ti,
        'frp': frp,
        'confidence': conf,
        'scan': row['scan'],
        'track': row['track'],
        'nearest_industry_distance_m': dist,
        'industries_within_500m': ind_500,
        'industries_within_1km': ind_1k,
        'industries_within_2km': ind_2k,
        'NDVI': ndvi,
        'NDBI': ndbi,
        'NDWI': ndwi,
        'cluster_event_count': n_ev,
        'cluster_unique_dates': u_dates,
        'cluster_span_days': span,
        'persistence_summary': row['persistence_summary'],
        'nearest_industry_name': row['nearest_industry_name'] if pd.notna(row['nearest_industry_name']) else '',
        'nearest_man_made': row['nearest_man_made'] if pd.notna(row['nearest_man_made']) else '',
        'nearest_power': row['nearest_power'] if pd.notna(row['nearest_power']) else '',
        'osm_context_summary': ctx_str,
        'candidate_class': cand_class,
        'candidate_evidence_summary': evidence,
        'evidence_confidence': ev_conf,
        'validation_action_required': action,
        'annotator_id': '',
        'annotator_notes': '',
        'final_label': 'Unknown',
        'label_status': 'Needs Human Validation'
    })

sheet_df = pd.DataFrame(rows)

# Save sheet
output_csv = os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv")
sheet_df.to_csv(output_csv, index=False)
print(f"HUMAN_LABELING_SHEET.csv created with {len(sheet_df)} rows and {len(sheet_df.columns)} columns at {output_csv}")

print("\nCandidate Class Breakdown across all 202 events:")
print(sheet_df['candidate_class'].value_counts())

print("\nEvidence Confidence Breakdown:")
print(sheet_df['evidence_confidence'].value_counts())

print("\nFinal Label Verification:")
print("final_label unique values:", sheet_df['final_label'].unique())
print("label_status unique values:", sheet_df['label_status'].unique())
