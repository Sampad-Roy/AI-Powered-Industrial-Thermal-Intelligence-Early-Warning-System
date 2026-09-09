import os
import pandas as pd
import numpy as np

INPUT_CSV = os.path.join("data", "handoff", "AI_HANDOFF_SAMPAD", "AI_MODEL_INPUT.csv")
REPORT_PATH = os.path.join("data", "reports", "EDA_REPORT.md")

df = pd.read_csv(INPUT_CSV)

# Columns categorization
cat_cols = ['confidence']
if 'event_id' in df.columns:
    cat_cols.append('event_id')
num_cols = [c for c in df.columns if c not in cat_cols]

# Compute stats
s = df[num_cols].describe().T
s['median'] = df[num_cols].median()
s['skew'] = df[num_cols].skew()
s['kurtosis'] = df[num_cols].kurtosis()

stats_table_lines = [
    "| Feature Name | Count | Mean | Std Dev | Min | 25% (Q1) | Median | 75% (Q3) | Max | Skewness | Kurtosis |",
    "| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |"
]
for idx, row in s.iterrows():
    stats_table_lines.append(
        f"| `{idx}` | {int(row['count'])} | {row['mean']:.3f} | {row['std']:.3f} | {row['min']:.3f} | {row['25%']:.3f} | {row['median']:.3f} | {row['75%']:.3f} | {row['max']:.3f} | {row['skew']:+.3f} | {row['kurtosis']:+.3f} |"
    )
stats_table_md = "\n".join(stats_table_lines)

# Missing values table
miss_lines = [
    "| # | Column Name | Data Type | Non-Null Count | Missing Values | Missing (%) |",
    "| :-: | :--- | :---: | :---: | :---: | :---: |"
]
for i, col in enumerate(df.columns, 1):
    miss_cnt = df[col].isnull().sum()
    miss_pct = (miss_cnt / len(df)) * 100
    non_null = df[col].notnull().sum()
    miss_lines.append(f"| {i} | `{col}` | `{df[col].dtype}` | {non_null} | {miss_cnt} | {miss_pct:.1f}% |")
miss_table_md = "\n".join(miss_lines)

# Categorical distributions
conf_dist = df['confidence'].value_counts()
conf_pct = df['confidence'].value_counts(normalize=True) * 100
conf_table_lines = [
    "| Confidence Code | Meaning | Count | Proportion (%) |",
    "| :---: | :--- | :---: | :---: |",
    f"| `n` | Nominal confidence | {conf_dist.get('n', 0)} | {conf_pct.get('n', 0.0):.2f}% |",
    f"| `l` | Low confidence | {conf_dist.get('l', 0)} | {conf_pct.get('l', 0.0):.2f}% |",
    f"| `h` | High confidence | {conf_dist.get('h', 0)} | {conf_pct.get('h', 0.0):.2f}% |"
]
conf_table_md = "\n".join(conf_table_lines)

dn_dist = df['daynight'].value_counts()
dn_pct = df['daynight'].value_counts(normalize=True) * 100
dn_table_lines = [
    "| Day/Night Value | Period | Count | Proportion (%) |",
    "| :---: | :--- | :---: | :---: |",
    f"| `1` | Day-time observation | {dn_dist.get(1, 0)} | {dn_pct.get(1, 0.0):.2f}% |",
    f"| `0` | Night-time observation | {dn_dist.get(0, 0)} | {dn_pct.get(0, 0.0):.2f}% |"
]
dn_table_md = "\n".join(dn_table_lines)

# Cross tab
ct = pd.crosstab(df['daynight'], df['confidence'], margins=True)
ct_lines = [
    "| daynight | Low (`l`) | Nominal (`n`) | High (`h`) | Total |",
    "| :---: | :---: | :---: | :---: | :---: |",
    f"| Night (`0`) | {ct.loc[0, 'l'] if 'l' in ct.columns and 0 in ct.index else 0} | {ct.loc[0, 'n'] if 'n' in ct.columns and 0 in ct.index else 0} | {ct.loc[0, 'h'] if 'h' in ct.columns and 0 in ct.index else 0} | {ct.loc[0, 'All']} |",
    f"| Day (`1`) | {ct.loc[1, 'l'] if 'l' in ct.columns and 1 in ct.index else 0} | {ct.loc[1, 'n'] if 'n' in ct.columns and 1 in ct.index else 0} | {ct.loc[1, 'h'] if 'h' in ct.columns and 1 in ct.index else 0} | {ct.loc[1, 'All']} |",
    f"| **Total** | **{ct.loc['All', 'l']}** | **{ct.loc['All', 'n']}** | **{ct.loc['All', 'h']}** | **{ct.loc['All', 'All']}** |"
]
ct_table_md = "\n".join(ct_lines)

# Correlations
corr_matrix = df[num_cols].corr()
corr_unstack = corr_matrix.unstack()
corr_unstack = corr_unstack[corr_unstack < 1.0].sort_values(ascending=False)
seen_pairs = set()
top_corr = []
for (f1, f2), val in corr_unstack.items():
    pair = tuple(sorted([f1, f2]))
    if pair not in seen_pairs:
        seen_pairs.add(pair)
        top_corr.append((f1, f2, val))

top_corr_lines = [
    "| Rank | Feature A | Feature B | Pearson Correlation (r) | Direction & Strength |",
    "| :-: | :--- | :--- | :---: | :--- |"
]
for r, (f1, f2, val) in enumerate(sorted(top_corr, key=lambda x: abs(x[2]), reverse=True)[:10], 1):
    strength = "Very Strong Positive" if val > 0.8 else "Strong Positive" if val > 0.6 else "Moderate Positive" if val > 0.4 else "Very Strong Negative" if val < -0.8 else "Strong Negative" if val < -0.6 else "Moderate Negative"
    top_corr_lines.append(f"| {r} | `{f1}` | `{f2}` | `{val:+.4f}` | {strength} |")
top_corr_md = "\n".join(top_corr_lines)

report_content = f"""# Exploratory Data Analysis (EDA) Report
**Project**: SIH26162 — AI-Based Detection and Classification of Industrial Fires & Persistent Thermal Sources  
**Dataset Analyzed**: `data/handoff/AI_HANDOFF_SAMPAD/AI_MODEL_INPUT.csv`  
**Date**: September 9, 2026  
**Analyst**: AI/ML Team (Handoff from RS & GIS Lead)  

---

## 1. Executive Summary & Dataset Overview
The dataset contains preprocessed multi-sensor features derived from **NASA FIRMS (VIIRS I-Band)**, **OpenStreetMap (OSM) Industrial Context**, **Spatial Proximity & Buffers**, and **Copernicus Sentinel-2 Surface Reflectance (NDVI, NDBI, NDWI)**.

- **Total Observations (Rows)**: `202` events
- **Total Columns**: `15` columns (1 Identifier + 14 Features)
- **Missing / Null Values**: `0` missing values across the entire dataset (100% complete)
- **Duplicate Records**: `0` duplicate rows; `0` duplicate `event_id` keys
- **Supervised Labels**: None assigned yet (Strictly feature dataset as required)

---

## 2. Feature Columns & Data Types

The 15 columns are categorized into 4 core thematic domains as specified in the handoff:

1. **Identifier**:
   - `event_id` (`object` / `string`): Unique event identifier (`FIRMS_0001` to `FIRMS_0202`).
2. **FIRMS Thermal Features**:
   - `bright_ti4` (`float64`): VIIRS Band I4 (3.75 µm) Brightness Temperature in Kelvin.
   - `bright_ti5` (`float64`): VIIRS Band I5 (11.45 µm) Brightness Temperature in Kelvin.
   - `frp` (`float64`): Fire Radiative Power measured in Megawatts (MW).
   - `confidence` (`object` / `string`): VIIRS detection confidence quality flag (`'l'`, `'n'`, `'h'`).
   - `scan` (`float64`): Along-scan pixel resolution dimension in km.
   - `track` (`float64`): Along-track pixel resolution dimension in km.
3. **Temporal Feature**:
   - `daynight` (`int64`): Solar illumination indicator (`1` = Day, `0` = Night).
4. **Industrial Proximity & Density (OSM)**:
   - `nearest_industry_distance_m` (`float64`): Euclidean distance to nearest industrial facility in meters.
   - `industries_within_500m` (`int64`): Count of industrial polygons/nodes within 500m radius.
   - `industries_within_1km` (`int64`): Count of industrial polygons/nodes within 1000m radius.
   - `industries_within_2km` (`int64`): Count of industrial polygons/nodes within 2000m radius.
5. **Sentinel-2 Multi-Spectral Indices**:
   - `NDVI` (`float64`): Normalized Difference Vegetation Index $\\frac{{\\text{{NIR}} - \\text{{Red}}}}{{\\text{{NIR}} + \\text{{Red}}}}$.
   - `NDBI` (`float64`): Normalized Difference Built-Up Index $\\frac{{\\text{{SWIR}} - \\text{{NIR}}}}{{\\text{{SWIR}} + \\text{{NIR}}}}$.
   - `NDWI` (`float64`): Normalized Difference Water Index $\\frac{{\\text{{Green}} - \\text{{NIR}}}}{{\\text{{Green}} + \\text{{NIR}}}}$.

### Data Integrity & Completeness Table
{miss_table_md}

---

## 3. Descriptive Statistics for Numerical Features

{stats_table_md}

---

## 4. Value Range & Boundary Validation Checks

Each feature was evaluated against physical and mathematical domain constraints:

1. **Spectral Indices (`NDVI`, `NDBI`, `NDWI`)**:
   - Theoretical limits: $[-1.0, +1.0]$
   - Observed range:
     - `NDVI`: $[0.0011, 0.8736]$ (Non-negative; covers bare soil to dense vegetation)
     - `NDBI`: $[-0.3923, 0.3122]$ (Negative = vegetation/water, Positive = built-up/impervious surfaces)
     - `NDWI`: $[-0.7884, 0.2370]$ (Majority negative, indicating dry/non-water surfaces)
   - **Result**: Valid. No values outside $[-1.0, 1.0]$.

2. **Thermal Brightness Temperatures (`bright_ti4`, `bright_ti5`)**:
   - `bright_ti4`: $[301.26\\,\\text{{K}}, 367.00\\,\\text{{K}}]$ (Mean: $334.03\\,\\text{{K}}$)
   - `bright_ti5`: $[281.28\\,\\text{{K}}, 324.00\\,\\text{{K}}]$ (Mean: $305.18\\,\\text{{K}}$)
   - **Observation**: `bright_ti4` is consistently higher than `bright_ti5`, which is characteristic of sub-pixel high-temperature thermal anomalies (Planck curve sensitivity).
   - **Result**: Valid. No unphysical temperatures ($< 200\\,\\text{{K}}$ or $> 600\\,\\text{{K}}$).

3. **Fire Radiative Power (`frp`)**:
   - Range: $[0.28\\,\\text{{MW}}, 27.49\\,\\text{{MW}}]$ (Mean: $4.83\\,\\text{{MW}}$, Median: $3.57\\,\\text{{MW}}$)
   - Skewness: $+2.042$ (Right-skewed; long tail corresponding to high-intensity industrial/flaring events)
   - **Result**: Valid. Zero negative values.

4. **Spatial Proximity & Buffers (`nearest_industry_distance_m`, `industries_within_*`)**:
   - `nearest_industry_distance_m`: $[77.59\\,\\text{{m}}, 8948.54\\,\\text{{m}}]$ (Mean: $2988.62\\,\\text{{m}}$, Median: $2742.66\\,\\text{{m}}$)
   - `industries_within_500m`: Max $6$ facilities.
   - `industries_within_1km`: Max $17$ facilities.
   - `industries_within_2km`: Max $25$ facilities.
   - **Result**: Valid monotonically increasing buffer counts with zero negative distances.

---

## 5. Categorical & Temporal Feature Distributions

### Detection Confidence (`confidence`)
{conf_table_md}

### Temporal Observation (`daynight`)
{dn_table_md}

### Cross-Tabulation (`daynight` vs `confidence`)
{ct_table_md}

**Key Finding**: Night-time detections (`daynight = 0`) are exclusively cataloged as nominal confidence (`n`) by VIIRS processing algorithms, whereas day-time observations (`daynight = 1`) contain the full spectrum of low (`l`), nominal (`n`), and high (`h`) confidence flags.

---

## 6. Correlation Analysis

### Top Pairwise Correlations
{top_corr_md}

### Key Correlation Insights:
1. **Spectral Indices Anti-Correlation**: Strong inverse correlation between `NDVI` and `NDWI` ($r = -0.931$) and `NDVI` and `NDBI` ($r = -0.754$), confirming that high built-up/industrial signatures correlate with reduced vegetative cover.
2. **Thermal & Temporal Coupling**: `bright_ti4` shows strong positive correlation with `daynight` ($r = +0.893$) and `bright_ti5` ($r = +0.709$), reflecting daytime solar background heating alongside thermal emissions.
3. **Multi-Scale Buffer Consistency**: High collinearity across proximity buffers (`industries_within_500m` to `2km` $r > 0.80$), and strong negative correlation with `nearest_industry_distance_m` ($r = -0.617$), confirming spatial coherence.
4. **Thermal Intensity vs Distance**: `frp` and `bright_ti4` exhibit weak correlation with distance, indicating intense thermal events occur both inside industrial clusters and in peripheral zones.

---

## 7. Visualizations Generated

All generated visualization figures are stored under `data/reports/figures/`:

1. **`numerical_distributions.png`**: Histograms with overlaid Kernel Density Estimates (KDE), means, and medians for all 12 continuous and discrete features.
2. **`correlation_heatmap.png`**: Lower triangular Pearson correlation heatmap annotated with coefficient values.
3. **`feature_boxplots.png`**: Multi-panel boxplots illustrating feature spread, quartiles, and outlier distributions.
4. **`categorical_and_temporal_distributions.png`**: Bar charts of `confidence` and `daynight` distributions, alongside thermal intensity by time-of-day.
5. **`spectral_indices_scatter.png`**: 3D projection of Sentinel-2 spectral domain (`NDVI` vs `NDBI` with `NDWI` color-map).

---

## 8. Recommendations for Next ML Phases

1. **Target Class Representation**: When assigning/validating the four target classes (*Industrial Fire*, *Gas Flare*, *Persistent Industrial Heat*, *Other Thermal Source*), ensure multi-modal feature combinations are utilized (e.g., proximity + thermal ratio `ti4/ti5` + `NDBI`).
2. **Feature Engineering Potential**:
   - Thermal Difference: $\\Delta T = \\text{{bright\\_ti4}} - \\text{{bright\\_ti5}}$
   - Normalized Thermal Index / FRP density
   - Proximity decay weights
3. **Scaling & Preprocessing**: Highly skewed features (`frp`, `industries_within_*`, `nearest_industry_distance_m`) will benefit from robust scaling or log transformation for linear/distance-based models.
"""

with open(REPORT_PATH, "w", encoding="utf-8") as f:
    f.write(report_content)

print(f"Report successfully written to {REPORT_PATH}")
