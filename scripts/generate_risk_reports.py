"""
SIH26162: Evaluation script for the Multi-Factor Risk Scoring Engine.
Applies the trained XGBoost model to all 202 satellite thermal events,
computes sub-scores and final risk scores, produces visual distribution plots,
and generates comprehensive dataset reports.
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from src.risk.risk_engine import (
    evaluate_event_risk,
    compute_dataset_risk_scores,
    CLASS_HAZARD_WEIGHTS,
    DEFAULT_COMPONENT_WEIGHTS
)

def main():
    os.makedirs('data/reports', exist_ok=True)
    os.makedirs('data/reports/figures', exist_ok=True)

    # 1. Load Trained XGBoost Model & Preprocessing Assets
    model = joblib.load('data/models/xgboost_model.pkl')
    le = joblib.load('data/models/label_encoder.pkl')
    with open('data/models/feature_schema.json', 'r') as f:
        schema = json.load(f)
    
    feature_cols = schema['feature_names']
    class_names = list(le.classes_)

    # 2. Load the full 202-event dataset
    raw_df = pd.read_csv('data/reports/HUMAN_LABELING_SHEET.csv')
    print(f"Loaded {len(raw_df)} total events from HUMAN_LABELING_SHEET.csv")

    # Map column names to standard feature schema
    df = raw_df.copy()
    if 'nearest_industry_distance_m' in df.columns and 'distance_to_industry' not in df.columns:
        df['distance_to_industry'] = df['nearest_industry_distance_m']
    if 'delta_ti4_ti5' in df.columns and 'delta_t' not in df.columns:
        df['delta_t'] = df['delta_ti4_ti5']

    # Extract model feature matrix
    X = df[feature_cols].copy()
    
    # Generate XGBoost predictions and probabilities
    probs = model.predict_proba(X)
    preds = np.argmax(probs, axis=1)
    confidences = np.max(probs, axis=1)
    pred_labels = [class_names[p] for p in preds]

    df['predicted_class'] = pred_labels
    df['confidence'] = confidences

    # 3. Compute Risk Scores for all events
    scored_records = []
    for i, row in df.iterrows():
        event_dict = row.to_dict()
        event_risk = evaluate_event_risk(event_dict)
        scored_records.append(event_risk)

    risk_df = pd.DataFrame(scored_records)

    # Save CSV with required exact schema
    output_cols = [
        "event_id",
        "predicted_class",
        "confidence",
        "thermal_score",
        "persistence_score",
        "industrial_proximity_score",
        "recurrence_score",
        "ml_confidence_score",
        "final_risk_score",
        "risk_level",
        "top_risk_factors"
    ]
    risk_df = risk_df[output_cols]
    csv_path = 'data/reports/risk_scores.csv'
    risk_df.to_csv(csv_path, index=False)
    print(f"Saved risk scores to {csv_path} ({len(risk_df)} records)")

    # 4. Print Summary Statistics
    print("\n--- RISK SCORES DISTRIBUTION SUMMARY ---")
    print(risk_df['risk_level'].value_counts())
    print("\n--- RISK LEVEL BY PREDICTED CLASS ---")
    print(pd.crosstab(risk_df['predicted_class'], risk_df['risk_level']))
    print("\n--- AVERAGE SCORES BY CLASS ---")
    print(risk_df.groupby('predicted_class')[['thermal_score', 'persistence_score', 'industrial_proximity_score', 'recurrence_score', 'ml_confidence_score', 'final_risk_score']].mean().round(2))

    # 5. Generate Professional Multi-Panel Visualization
    sns.set_theme(style="whitegrid", font_scale=1.0)
    fig, axes = plt.subplots(2, 2, figsize=(16, 13))
    plt.subplots_adjust(hspace=0.35, wspace=0.25)

    palette_classes = {
        "Gas Flare": "#ff7f0e",
        "Industrial Fire": "#d62728",
        "Persistent Industrial Heat": "#1f77b4",
        "Other Thermal Source": "#2ca02c"
    }

    palette_levels = {
        "LOW": "#2ca02c",
        "MODERATE": "#ffbb78",
        "HIGH": "#ff7f0e",
        "CRITICAL": "#d62728"
    }

    # Panel A: Boxplot / Stripplot of Final Risk Scores by Predicted Class
    ax1 = axes[0, 0]
    sns.boxplot(
        data=risk_df,
        x="predicted_class",
        y="final_risk_score",
        palette=palette_classes,
        ax=ax1,
        boxprops=dict(alpha=0.7),
        showmeans=True,
        meanprops={"marker":"o", "markerfacecolor":"white", "markeredgecolor":"black"}
    )
    sns.stripplot(
        data=risk_df,
        x="predicted_class",
        y="final_risk_score",
        color="black",
        alpha=0.4,
        jitter=0.2,
        size=5,
        ax=ax1
    )
    ax1.axhline(25, color="#ffbb78", linestyle="--", linewidth=1.2, label="MODERATE (25)")
    ax1.axhline(50, color="#ff7f0e", linestyle="--", linewidth=1.2, label="HIGH (50)")
    ax1.axhline(75, color="#d62728", linestyle="--", linewidth=1.2, label="CRITICAL (75)")
    ax1.set_title("A. Final Risk Score Distribution by Predicted Class", fontsize=13, fontweight='bold', pad=10)
    ax1.set_xlabel("Predicted Class", fontweight='bold')
    ax1.set_ylabel("Final Risk Score (0-100)", fontweight='bold')
    ax1.set_ylim(-2, 102)
    ax1.legend(loc='lower left', framealpha=0.9, fontsize=9)

    # Panel B: Risk Level Breakdown (Counts & Percentages)
    ax2 = axes[0, 1]
    level_order = ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    level_counts = risk_df['risk_level'].value_counts().reindex(level_order, fill_value=0)
    total_events = len(risk_df)
    
    bars = ax2.bar(
        level_order,
        level_counts.values,
        color=[palette_levels[l] for l in level_order],
        edgecolor='black',
        linewidth=1.2,
        alpha=0.85
    )
    for bar in bars:
        height = bar.get_height()
        pct = (height / total_events) * 100
        ax2.annotate(
            f'{height}\n({pct:.1f}%)',
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 4),
            textcoords="offset points",
            ha='center',
            va='bottom',
            fontweight='bold',
            fontsize=10
        )
    ax2.set_title(f"B. Dataset Risk Level Classification (N={total_events})", fontsize=13, fontweight='bold', pad=10)
    ax2.set_xlabel("Risk Category Level", fontweight='bold')
    ax2.set_ylabel("Number of Detected Events", fontweight='bold')
    ax2.set_ylim(0, max(level_counts.values) * 1.22)

    # Panel C: Component Score Profiles per Class (Bar chart)
    ax3 = axes[1, 0]
    comp_cols = [
        ('thermal_score', 'Thermal Severity'),
        ('industrial_proximity_score', 'Industrial Proximity'),
        ('persistence_score', 'Persistence'),
        ('recurrence_score', 'Recurrence'),
        ('ml_confidence_score', 'ML Hazard')
    ]
    
    avg_profiles = risk_df.groupby('predicted_class')[[c[0] for c in comp_cols]].mean().reset_index()
    melted = pd.melt(avg_profiles, id_vars=['predicted_class'], value_vars=[c[0] for c in comp_cols],
                     var_name='Component', value_name='Average Score')
    
    comp_map = dict(comp_cols)
    melted['Component'] = melted['Component'].map(comp_map)
    
    sns.barplot(
        data=melted,
        x='Component',
        y='Average Score',
        hue='predicted_class',
        palette=palette_classes,
        ax=ax3,
        edgecolor='black',
        alpha=0.9
    )
    ax3.set_title("C. Average Sub-Component Scores by Class Profile", fontsize=13, fontweight='bold', pad=10)
    ax3.set_xlabel("Interpretable Risk Component", fontweight='bold')
    ax3.set_ylabel("Mean Sub-Score (0-100)", fontweight='bold')
    ax3.tick_params(axis='x', rotation=15)
    ax3.set_ylim(0, 105)
    ax3.legend(title="Predicted Class", loc='upper right', fontsize=8.5, framealpha=0.9)

    # Panel D: Scatter Plot - Thermal Severity vs Industrial Proximity
    ax4 = axes[1, 1]
    # Re-merge distance and FRP for physical reference
    plot_df = risk_df.copy()
    plot_df['frp'] = df['frp']
    plot_df['distance_to_industry'] = df['distance_to_industry']
    
    scatter = sns.scatterplot(
        data=plot_df,
        x="industrial_proximity_score",
        y="thermal_score",
        hue="risk_level",
        hue_order=level_order,
        palette=palette_levels,
        style="predicted_class",
        s=80,
        alpha=0.85,
        edgecolor='black',
        ax=ax4
    )
    ax4.set_title("D. Thermal Severity vs Industrial Proximity by Risk Level", fontsize=13, fontweight='bold', pad=10)
    ax4.set_xlabel("Industrial Proximity Score (0-100)", fontweight='bold')
    ax4.set_ylabel("Thermal Severity Score (0-100)", fontweight='bold')
    ax4.set_xlim(-5, 105)
    ax4.set_ylim(-5, 105)
    ax4.legend(loc='upper right', fontsize=8, framealpha=0.9, title="Risk Level / Class")

    fig.suptitle("SIH26162: Explainable Multi-Factor Risk Scoring Engine Audit", fontsize=16, fontweight='bold', y=0.99)
    plt.tight_layout(rect=[0, 0, 1, 0.97])

    img_path = 'data/reports/risk_distribution.png'
    fig.savefig(img_path, dpi=300)
    plt.close(fig)
    print(f"Saved distribution visualization to {img_path}")

    # Also save a copy in figures/
    fig_copy_path = 'data/reports/figures/risk_distribution.png'
    import shutil
    shutil.copyfile(img_path, fig_copy_path)

if __name__ == '__main__':
    main()
