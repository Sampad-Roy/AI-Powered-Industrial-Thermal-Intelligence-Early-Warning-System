import os
import pandas as pd

df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))
c4 = df[df['cluster_id'] == 4].sort_values(by=['acq_date', 'acq_time']).reset_index(drop=True)

for i, r in c4.iterrows():
    print(f"| {i+1} | `{r['event_id']}` | `{r['latitude']:.5f}, {r['longitude']:.5f}` | `{r['acq_date']} {r['acq_time']}` | `{r['frp']:.2f}` | `{r['bright_ti4']:.2f}` | `{r['bright_ti5']:.2f}` | `{r['delta_ti4_ti5']:.2f}` | `Night (0)` | `{r['nearest_industry_distance_m']:.1f}` | `{r['industries_within_500m']}/{r['industries_within_1km']}/{r['industries_within_2km']}` | `{r['NDVI']:.3f}` | `{r['NDBI']:.3f}` | `{r['NDWI']:.3f}` | `{r['confidence']}` |")
