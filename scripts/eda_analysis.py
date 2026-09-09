import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set paths
INPUT_CSV = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")
REPORT_DIR = os.path.join("data", "reports")
FIG_DIR = os.path.join(REPORT_DIR, "figures")
os.makedirs(FIG_DIR, exist_ok=True)

# 1. Load CSV
df = pd.read_csv(INPUT_CSV)
print("="*60)
print("1. DATASET LOADED SUCCESSFULLY")
print("="*60)

# 2. Dataset Shape
shape = df.shape
print(f"Dataset Shape: {shape[0]} rows, {shape[1]} columns")

# 3. List feature columns
columns = list(df.columns)
print(f"All {len(columns)} columns:")
for i, col in enumerate(columns, 1):
    print(f"  {i}. {col}")

# 4. Data Types
print("\n" + "="*60)
print("4. DATA TYPES")
print("="*60)
print(df.dtypes)

# 5. Missing Values
print("\n" + "="*60)
print("5. MISSING VALUES PER COLUMN")
print("="*60)
missing = df.isnull().sum()
missing_pct = (df.isnull().sum() / len(df)) * 100
missing_df = pd.DataFrame({'Missing_Count': missing, 'Missing_Pct': missing_pct})
print(missing_df)

# 6. Duplicates
print("\n" + "="*60)
print("6. DUPLICATE ANALYSIS")
print("="*60)
dup_rows = df.duplicated().sum()
print(f"Total duplicate rows across all columns: {dup_rows}")
if 'event_id' in df.columns:
    dup_event_ids = df['event_id'].duplicated().sum()
    print(f"Duplicate event_ids: {dup_event_ids}")
    unique_events = df['event_id'].nunique()
    print(f"Unique event_ids: {unique_events}")
else:
    dup_event_ids = None

# Identify numerical vs categorical features
categorical_cols = ['confidence']
if 'event_id' in df.columns:
    categorical_cols.append('event_id')
numerical_cols = [c for c in df.columns if c not in categorical_cols]

# 7. Descriptive Statistics for Numerical Features
print("\n" + "="*60)
print("7. DESCRIPTIVE STATISTICS (NUMERICAL FEATURES)")
print("="*60)
desc_stats = df[numerical_cols].describe().T
desc_stats['median'] = df[numerical_cols].median()
desc_stats['skew'] = df[numerical_cols].skew()
desc_stats['kurtosis'] = df[numerical_cols].kurtosis()
print(desc_stats[['count', 'mean', 'std', 'min', '25%', 'median', '75%', 'max', 'skew', 'kurtosis']])

# 8. Minimum, Maximum and Suspicious Values Check
print("\n" + "="*60)
print("8. MINIMUM, MAXIMUM AND VALUE BOUNDARY CHECKS")
print("="*60)
for col in numerical_cols:
    c_min = df[col].min()
    c_max = df[col].max()
    print(f"Feature: {col:30s} | Min: {c_min:10.4f} | Max: {c_max:10.4f}")

# Check specific domain bounds:
# NDVI, NDBI, NDWI should strictly be between -1.0 and +1.0
# bright_ti4, bright_ti5 are in Kelvin (typically 200 - 500 K)
# frp >= 0 (Fire Radiative Power in MW)
# distance >= 0
# counts >= 0
# daynight in {0, 1}
suspicious_notes = []
for idx_col in ['NDVI', 'NDDBI', 'NDBI', 'NDWI']:
    if idx_col in df.columns:
        out_of_bounds = df[(df[idx_col] < -1.0) | (df[idx_col] > 1.0)]
        if len(out_of_bounds) > 0:
            suspicious_notes.append(f"{idx_col} has {len(out_of_bounds)} values outside [-1, 1]")
        else:
            suspicious_notes.append(f"{idx_col} is completely within theoretical [-1.0, 1.0] range (Min: {df[idx_col].min():.4f}, Max: {df[idx_col].max():.4f})")

if 'frp' in df.columns:
    neg_frp = df[df['frp'] < 0]
    suspicious_notes.append(f"FRP negative values: {len(neg_frp)} (Min FRP: {df['frp'].min():.2f} MW, Max FRP: {df['frp'].max():.2f} MW)")

if 'daynight' in df.columns:
    suspicious_notes.append(f"daynight unique values: {df['daynight'].unique().tolist()}")

print("\nDomain Checks:")
for sn in suspicious_notes:
    print(f" - {sn}")

# 9. Confidence and Daynight distributions
print("\n" + "="*60)
print("9. CATEGORICAL & TEMPORAL FEATURE DISTRIBUTIONS")
print("="*60)
if 'confidence' in df.columns:
    print("\nConfidence distribution:")
    conf_counts = df['confidence'].value_counts()
    conf_pct = df['confidence'].value_counts(normalize=True) * 100
    conf_df = pd.DataFrame({'Count': conf_counts, 'Percentage (%)': conf_pct})
    print(conf_df)

if 'daynight' in df.columns:
    print("\nDayNight distribution (0=Night, 1=Day / D/N):")
    dn_counts = df['daynight'].value_counts()
    dn_pct = df['daynight'].value_counts(normalize=True) * 100
    dn_df = pd.DataFrame({'Count': dn_counts, 'Percentage (%)': dn_pct})
    print(dn_df)

# Cross-tabulation of daynight and confidence
if 'confidence' in df.columns and 'daynight' in df.columns:
    print("\nCross-tabulation (Daynight vs Confidence):")
    print(pd.crosstab(df['daynight'], df['confidence'], margins=True))

# 10. Correlations
print("\n" + "="*60)
print("10. NUMERICAL FEATURE CORRELATIONS")
print("="*60)
corr_matrix = df[numerical_cols].corr()
print(corr_matrix.round(3))

# Find top positive and negative correlations (excluding diagonal)
corr_unstack = corr_matrix.unstack()
corr_unstack = corr_unstack[corr_unstack < 1.0].sort_values(ascending=False)
seen_pairs = set()
top_corr = []
for (f1, f2), val in corr_unstack.items():
    pair = tuple(sorted([f1, f2]))
    if pair not in seen_pairs:
        seen_pairs.add(pair)
        top_corr.append((f1, f2, val))

print("\nTop 10 Strongest Correlations (Pairwise):")
for f1, f2, val in sorted(top_corr, key=lambda x: abs(x[2]), reverse=True)[:10]:
    print(f"  {f1:30s} <-> {f2:30s} : {val:+.4f}")

# 11. Visualizations
print("\n" + "="*60)
print("11. GENERATING VISUALIZATION PLOTS")
print("="*60)

# Plot styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['figure.dpi'] = 300

# 11.1 Main Numerical Distributions (Histograms + KDE)
plot_features = [
    'bright_ti4', 'bright_ti5', 'frp', 'scan', 'track',
    'nearest_industry_distance_m', 'industries_within_500m', 
    'industries_within_1km', 'industries_within_2km',
    'NDVI', 'NDBI', 'NDWI'
]
available_plot_feats = [f for f in plot_features if f in df.columns]

n_cols = 3
n_rows = (len(available_plot_feats) + n_cols - 1) // n_cols
fig, axes = plt.subplots(n_rows, n_cols, figsize=(16, 4 * n_rows))
axes = axes.flatten()

for i, feat in enumerate(available_plot_feats):
    ax = axes[i]
    sns.histplot(df[feat], kde=True, ax=ax, color='#1f77b4', edgecolor='black', alpha=0.6)
    mean_val = df[feat].mean()
    median_val = df[feat].median()
    ax.axvline(mean_val, color='crimson', linestyle='--', linewidth=1.5, label=f'Mean: {mean_val:.2f}')
    ax.axvline(median_val, color='darkgreen', linestyle=':', linewidth=1.5, label=f'Median: {median_val:.2f}')
    ax.set_title(f'Distribution of {feat}', fontsize=12, fontweight='bold')
    ax.set_xlabel(feat, fontsize=10)
    ax.set_ylabel('Frequency', fontsize=10)
    ax.legend(fontsize=8, loc='best')

# Hide unused axes
for j in range(i + 1, len(axes)):
    fig.delaxes(axes[j])

plt.tight_layout()
dist_plot_path = os.path.join(FIG_DIR, "numerical_distributions.png")
plt.savefig(dist_plot_path, dpi=300)
plt.close()
print(f"Saved: {dist_plot_path}")

# 11.2 Correlation Heatmap
plt.figure(figsize=(12, 10))
mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
cmap = sns.diverging_palette(230, 20, as_cmap=True)
sns.heatmap(corr_matrix, mask=mask, cmap='coolwarm', vmin=-1, vmax=1, annot=True, 
            fmt=".2f", square=True, linewidths=.5, cbar_kws={"shrink": .8})
plt.title("Correlation Matrix of Numerical Features (NASA FIRMS + OSM + Sentinel-2)", fontsize=14, fontweight='bold', pad=15)
plt.tight_layout()
corr_plot_path = os.path.join(FIG_DIR, "correlation_heatmap.png")
plt.savefig(corr_plot_path, dpi=300)
plt.close()
print(f"Saved: {corr_plot_path}")

# 11.3 Boxplots for Outlier & Spread Inspection
fig, axes = plt.subplots(3, 3, figsize=(15, 12))
axes = axes.flatten()
box_features = [
    'bright_ti4', 'bright_ti5', 'frp', 
    'nearest_industry_distance_m', 'industries_within_1km', 'industries_within_2km',
    'NDVI', 'NDBI', 'NDWI'
]
for i, feat in enumerate(box_features):
    if feat in df.columns and i < len(axes):
        ax = axes[i]
        sns.boxplot(y=df[feat], ax=ax, color='#6baed6', width=0.4, fliersize=4)
        ax.set_title(f'Boxplot: {feat}', fontsize=11, fontweight='bold')
        ax.set_ylabel(feat, fontsize=10)

plt.tight_layout()
box_plot_path = os.path.join(FIG_DIR, "feature_boxplots.png")
plt.savefig(box_plot_path, dpi=300)
plt.close()
print(f"Saved: {box_plot_path}")

# 11.4 Categorical & Daynight feature distribution plots
fig, axes = plt.subplots(1, 3, figsize=(16, 5))

# DayNight count
sns.countplot(x='daynight', data=df, ax=axes[0], palette='Blues_d')
axes[0].set_title('Observation Time: Day vs Night (daynight)', fontsize=12, fontweight='bold')
axes[0].set_xlabel('Daynight (0=Night, 1=Day)', fontsize=10)
axes[0].set_ylabel('Count', fontsize=10)
for p in axes[0].patches:
    axes[0].annotate(f'{int(p.get_height())} ({p.get_height()/len(df)*100:.1f}%)',
                     (p.get_x() + p.get_width() / 2., p.get_height()),
                     ha = 'center', va = 'bottom', fontsize=9, xytext = (0, 3),
                     textcoords = 'offset points')

# Confidence count
sns.countplot(x='confidence', data=df, ax=axes[1], palette='Purples_d', order=['l', 'n', 'h'] if set(df['confidence'].unique()).issubset({'l','n','h'}) else None)
axes[1].set_title('Detection Confidence (l=low, n=nominal, h=high)', fontsize=12, fontweight='bold')
axes[1].set_xlabel('Confidence Category', fontsize=10)
axes[1].set_ylabel('Count', fontsize=10)
for p in axes[1].patches:
    axes[1].annotate(f'{int(p.get_height())} ({p.get_height()/len(df)*100:.1f}%)',
                     (p.get_x() + p.get_width() / 2., p.get_height()),
                     ha = 'center', va = 'bottom', fontsize=9, xytext = (0, 3),
                     textcoords = 'offset points')

# Cross distribution: Bright_ti4 across daynight
sns.boxplot(x='daynight', y='bright_ti4', hue='confidence', data=df, ax=axes[2], palette='Set2')
axes[2].set_title('Brightness Temp (TI4) by Daynight & Confidence', fontsize=12, fontweight='bold')
axes[2].set_xlabel('Daynight (0=Night, 1=Day)', fontsize=10)
axes[2].set_ylabel('Brightness Temperature I4 (K)', fontsize=10)

plt.tight_layout()
cat_plot_path = os.path.join(FIG_DIR, "categorical_and_temporal_distributions.png")
plt.savefig(cat_plot_path, dpi=300)
plt.close()
print(f"Saved: {cat_plot_path}")

# 11.5 Spectral Indices Relationship (NDVI vs NDBI colored by NDWI)
plt.figure(figsize=(9, 7))
scatter = plt.scatter(df['NDVI'], df['NDBI'], c=df['NDWI'], cmap='viridis', alpha=0.8, edgecolors='k', s=50)
cbar = plt.colorbar(scatter)
cbar.set_label('NDWI (Water Index)', fontsize=11)
plt.title('Sentinel-2 Spectral Indices: NDVI vs NDBI vs NDWI', fontsize=13, fontweight='bold')
plt.xlabel('NDVI (Vegetation Index)', fontsize=11)
plt.ylabel('NDBI (Built-Up / Bare Soil Index)', fontsize=11)
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
spectral_plot_path = os.path.join(FIG_DIR, "spectral_indices_scatter.png")
plt.savefig(spectral_plot_path, dpi=300)
plt.close()
print(f"Saved: {spectral_plot_path}")

print("\nAll plots generated successfully.")
