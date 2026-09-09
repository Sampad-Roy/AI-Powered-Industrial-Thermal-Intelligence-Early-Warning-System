import os
import pandas as pd

sheet_path = os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv")
model_input_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")

# Load existing sheet
df = pd.read_csv(sheet_path)
df_orig_features = pd.read_csv(model_input_path)

# Ensure string columns are object dtype
for col in ['annotator_id', 'annotator_notes', 'final_label', 'label_status']:
    df[col] = df[col].astype(object)

print(f"Loaded {len(df)} rows from {sheet_path}")

# Identify Cluster 4 events
c4_mask = df['cluster_id'] == 4
c4_event_ids = df.loc[c4_mask, 'event_id'].tolist()
print(f"Cluster 4 matches {len(c4_event_ids)} events:")
print(", ".join(c4_event_ids))

# Apply annotations
for idx in df[c4_mask].index:
    ev_id = df.loc[idx, 'event_id']
    df.loc[idx, 'final_label'] = 'Persistent Industrial Heat'
    df.loc[idx, 'label_status'] = 'Validated'
    df.loc[idx, 'annotator_id'] = 'SAMPAD_R'
    
    if ev_id == 'FIRMS_0014':
        df.loc[idx, 'annotator_notes'] = 'Cluster 4 member; elevated NDVI due to off-nadir pixel edge on green buffer.'
    elif ev_id == 'FIRMS_0094':
        df.loc[idx, 'annotator_notes'] = 'Cluster 4 member; off-nadir footprint shift on western industrial boundary.'
    else:
        df.loc[idx, 'annotator_notes'] = 'Confirmed chronic nocturnal heat source in industrial estate; 81d recurrence.'

# Save updated sheet
df.to_csv(sheet_path, index=False)
print(f"Successfully saved updated sheet to {sheet_path}")

# ================= VALIDATION CHECKS =================
print("\n" + "="*50)
print("RUNNING POST-UPDATE VALIDATION CHECKS")
print("="*50)

# Check 1: Label counts
print("\n1. final_label breakdown:")
print(df['final_label'].value_counts())

# Check 2: Status counts
print("\n2. label_status breakdown:")
print(df['label_status'].value_counts())

# Check 3: Annotator ID counts
print("\n3. annotator_id breakdown:")
print(df['annotator_id'].fillna('(empty)').value_counts())

# Check 4: Non-cluster 4 events untouched
non_c4 = df[~c4_mask]
assert (non_c4['final_label'] == 'Unknown').all(), "Error: Some non-cluster 4 events have non-Unknown labels!"
assert (non_c4['label_status'] == 'Needs Human Validation').all(), "Error: Some non-cluster 4 events have non-Needs Human Validation status!"
assert (non_c4['annotator_id'].isna() | (non_c4['annotator_id'] == '')).all(), "Error: Some non-cluster 4 events have annotator IDs!"
print("\n4. Verified: All 177 non-Cluster 4 events remain completely untouched ('Unknown', 'Needs Human Validation').")

# Check 5: Cluster 4 events strictly validated
c4_updated = df[c4_mask]
assert len(c4_updated) == 25, f"Expected 25 events in Cluster 4, found {len(c4_updated)}"
assert (c4_updated['final_label'] == 'Persistent Industrial Heat').all()
assert (c4_updated['label_status'] == 'Validated').all()
assert (c4_updated['annotator_id'] == 'SAMPAD_R').all()
print("5. Verified: All 25 Cluster 4 events are correctly labeled 'Persistent Industrial Heat' and 'Validated'.")

# Check 6: AI_MODEL_INPUT.csv untouched
model_input_now = pd.read_csv(model_input_path)
pd.testing.assert_frame_equal(df_orig_features, model_input_now)
print("6. Verified: Original AI_MODEL_INPUT.csv is 100% identical and unchanged.")

print("\nAll validation checks PASSED successfully!")
