import os
import pandas as pd

df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))
unval = df[df['final_label'] == 'Unknown'].copy()
unval['acq_date_dt'] = pd.to_datetime(unval['acq_date'])

clusters = []
for cid, g in unval.groupby('cluster_id'):
    n_events = len(g)
    u_dates = g['acq_date'].nunique()
    span = (g['acq_date_dt'].max() - g['acq_date_dt'].min()).days if n_events > 1 else 0
    mean_dist = g['nearest_industry_distance_m'].mean()
    mean_frp = g['frp'].mean()
    max_frp = g['frp'].max()
    mean_ti4 = g['bright_ti4'].mean()
    mean_ti5 = g['bright_ti5'].mean()
    delta_t = mean_ti4 - mean_ti5
    mean_ndvi = g['NDVI'].mean()
    mean_ndbi = g['NDBI'].mean()
    cand_class = g['candidate_class'].iloc[0]
    ev_conf = g['evidence_confidence'].iloc[0]
    context = '; '.join([c for c in g['osm_context_summary'].unique() if pd.notna(c)])
    event_ids = ', '.join(g['event_id'].tolist())
    
    clusters.append({
        'cluster_id': cid,
        'n_events': n_events,
        'u_dates': u_dates,
        'span_days': span,
        'mean_dist_m': mean_dist,
        'mean_frp': mean_frp,
        'max_frp': max_frp,
        'mean_ti4': mean_ti4,
        'delta_t': delta_t,
        'mean_ndvi': mean_ndvi,
        'mean_ndbi': mean_ndbi,
        'cand_class': cand_class,
        'ev_conf': ev_conf,
        'context': context,
        'event_ids': event_ids
    })

cdf = pd.DataFrame(clusters)

# Composite priority score:
# We rank by:
# 1. Recurrence (u_dates >= 2, span_days > 0)
# 2. Total events in cluster
# 3. Proximity to industry (smaller distance = higher industrial relevance)
# 4. Specific context tags available (e.g. named industries, works, generators)

def calc_score(r):
    score = 0
    score += r['u_dates'] * 25
    score += r['n_events'] * 15
    score += min(r['span_days'], 60) * 0.5
    if r['mean_dist_m'] < 1000:
        score += 30
    elif r['mean_dist_m'] < 2000:
        score += 15
    if r['context'] != 'Landuse: industrial' and r['context'] != '':
        score += 20 # Named industry / specialized works / generator tag
    return score

cdf['priority_score'] = cdf.apply(calc_score, axis=1)
ranked = cdf.sort_values(by='priority_score', ascending=False).reset_index(drop=True)

print("Top 10 Ranked Clusters among the remaining 177 unvalidated events:")
for i, r in ranked.head(10).iterrows():
    print(f"{i+1:2d}. Cluster {r['cluster_id']:3d} (Score: {r['priority_score']:5.1f}) | {r['n_events']} ev | {r['u_dates']} dates | {r['span_days']:2d}d span | Dist: {r['mean_dist_m']:6.1f}m | FRP: {r['mean_frp']:5.2f}MW | DeltaT: {r['delta_t']:4.1f}K | Class: {r['cand_class']} | Context: {r['context']}")
