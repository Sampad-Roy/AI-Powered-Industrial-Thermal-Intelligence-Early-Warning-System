import os
import pandas as pd

df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))
c74 = df[df['cluster_id'] == 74].sort_values(by=['acq_date', 'acq_time']).reset_index(drop=True)

for i, r in c74.iterrows():
    print(f"=== Event {i+1}: {r['event_id']} ===")
    for k, v in r.items():
        print(f"  {k:30s}: {v}")
