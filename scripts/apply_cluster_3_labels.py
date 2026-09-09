import os
import pandas as pd

sheet_path = os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv")
model_input_path = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")

# Load existing sheet
df = pd.read_csv(sheet_path)
df_orig_features = pd.read_csv(model_input_path)

# Ensure object columns
for col in ['annotator_id', 'annotator_notes', 'final_label', 'label_status']:
    df[col] = df[col].astype(object)

# Target events in Cluster 3
c3_notes = {
    'FIRMS_0005': 'Verified nocturnal operational baseline at Piplaj / Chiripal Industries complex; 54d recurrence.',
    'FIRMS_0139': 'Verified daytime operational thermal peak (21.4 MW) at Chiripal Industries (works); 54d recurrence.',
    'FIRMS_0142': 'Verified daytime industrial boiler/process heat at Piplaj industrial estate; co-located with Cluster 3.',
    'FIRMS_0143': 'Verified simultaneous multi-pixel thermal footprint at Piplaj industrial estate (NDBI +0.23); co-located.'
}

# Apply updates
for ev_id, note in c3_notes.items():
    idx = df[df['event_id'] == ev_id].index[0]
    df.loc[idx, 'final_label'] = 'Persistent Industrial Heat'
    df.loc[idx, 'label_status'] = 'Validated'
    df.loc[idx, 'annotator_id'] = 'SAMPAD_R'
    df.loc[idx, 'annotator_notes'] = note

# Save sheet
df.to_csv(sheet_path, index=False)
print(f"Successfully applied Cluster 3 annotations to {sheet_path}")

# ================= VALIDATION CHECKS =================
print("\n" + "="*50)
print("RUNNING POST-UPDATE VALIDATION CHECKS")
print("="*50)

# 1. Total Label breakdown
print("\n1. final_label breakdown:")
print(df['final_label'].value_counts())

# 2. Total Status breakdown
print("\n2. label_status breakdown:")
print(df['label_status'].value_counts())

# 3. Annotator ID breakdown
print("\n3. annotator_id breakdown:")
print(df['annotator_id'].fillna('(empty)').value_counts())

# 4. Check validated count is exactly 29 (25 from c4 + 4 from c3)
val_mask = df['label_status'] == 'Validated'
assert val_mask.sum() == 29, f"Expected 29 validated rows, found {val_mask.sum()}"
assert (df.loc[val_mask, 'final_label'] == 'Persistent Industrial Heat').all()
assert (df.loc[val_mask, 'annotator_id'] == 'SAMPAD_R').all()
print("\n4. Verified: Exactly 29 rows validated (25 from Cluster 4 + 4 from Cluster 3).")

# 5. Check remaining 173 rows are untouched
unval_mask = ~val_mask
assert unval_mask.sum() == 173, f"Expected 173 unvalidated rows, found {unval_mask.sum()}"
assert (df.loc[unval_mask, 'final_label'] == 'Unknown').all()
assert (df.loc[unval_mask, 'label_status'] == 'Needs Human Validation').all()
assert (df.loc[unval_mask, 'annotator_id'].isna() | (df.loc[unval_mask, 'annotator_id'] == '')).all()
print("5. Verified: All 173 remaining rows are strictly untouched ('Unknown', 'Needs Human Validation').")

# 6. Verify AI_MODEL_INPUT.csv
model_input_now = pd.read_csv(model_input_path)
pd.testing.assert_frame_equal(df_orig_features, model_input_now)
print("6. Verified: Original AI_MODEL_INPUT.csv is 100% untouched and identical.")

print("\nAll validation checks PASSED successfully!")
