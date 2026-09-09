import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

def main():
    # Ensure output directories exist
    os.makedirs('data/models', exist_ok=True)
    os.makedirs('data/reports', exist_ok=True)

    # 1. Load Data
    df = pd.read_csv('data/processed/model_features.csv')
    print(f"Total samples loaded: {len(df)}")
    print("Class distribution in ground truth dataset:")
    print(df['final_label'].value_counts())

    # 2. Separate features (X) and target (y)
    feature_cols = [
        'bright_ti4', 'bright_ti5', 'frp', 'delta_t', 'daynight',
        'distance_to_industry', 'industries_within_500m', 'industries_within_1km',
        'industries_within_2km', 'NDVI', 'NDBI', 'NDWI',
        'cluster_event_count', 'cluster_unique_dates', 'cluster_span_days'
    ]

    X = df[feature_cols].copy()
    y = df['final_label'].copy()

    # Check missing values
    assert X.isna().sum().sum() == 0, "Missing values found in X!"
    assert y.isna().sum() == 0, "Missing values found in y!"

    # 3. Encode Target Labels
    le = LabelEncoder()
    y_encoded = le.fit_transform(y)
    class_names = list(le.classes_)
    print("\nEncoded classes:", dict(zip(le.classes_, range(len(le.classes_)))))

    # 4. Save Feature Schema & Label Encoder
    feature_schema = {
        "feature_names": feature_cols,
        "num_features": len(feature_cols),
        "target_column": "final_label",
        "classes": class_names,
        "feature_types": {col: str(X[col].dtype) for col in feature_cols}
    }

    with open('data/models/feature_schema.json', 'w', encoding='utf-8') as f:
        json.dump(feature_schema, f, indent=2)

    joblib.dump(le, 'data/models/label_encoder.pkl')
    print("Saved feature_schema.json and label_encoder.pkl")

    # 5. Stratified Train/Test Split (80/20)
    # Stratify ensures each class (including Gas Flare with 2 samples) has proportional representation
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )

    print(f"\nTrain samples: {len(X_train)} ({len(X_train)/len(df)*100:.1f}%)")
    print(f"Test samples:  {len(X_test)} ({len(X_test)/len(df)*100:.1f}%)")
    print("Train class distribution:", dict(pd.Series(y_train).value_counts()))
    print("Test class distribution: ", dict(pd.Series(y_test).value_counts()))

    # 6. Train Random Forest Classifier
    # Using class_weight='balanced' to handle class imbalance without synthetic sample generation
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight='balanced',
        random_state=42,
        n_jobs=1
    )

    rf_model.fit(X_train, y_train)
    print("\nRandom Forest model successfully trained.")

    # 7. Evaluate on Test Set
    y_pred = rf_model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)

    prec_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    clf_report = classification_report(
        y_test, y_pred, target_names=class_names, output_dict=True, zero_division=0
    )
    conf_matrix = confusion_matrix(y_test, y_pred)

    print(f"\n--- EVALUATION METRICS ---")
    print(f"Accuracy:        {acc:.4f} ({acc*100:.1f}%)")
    print(f"Macro Precision: {prec_macro:.4f}")
    print(f"Macro Recall:    {rec_macro:.4f}")
    print(f"Macro F1-Score:  {f1_macro:.4f}")
    print(f"Weighted F1:     {f1_weighted:.4f}")

    # Cross-validation score on full training dataset
    skf = StratifiedKFold(n_splits=2, shuffle=True, random_state=42)
    cv_scores = cross_val_score(rf_model, X, y_encoded, cv=skf, scoring='f1_weighted', n_jobs=1)
    print(f"Stratified CV Weighted F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # 8. Feature Importances
    importances = pd.Series(rf_model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\nTop 5 Important Features:")
    print(importances.head(5).to_string())

    # 9. Save Model & Metrics
    joblib.dump(rf_model, 'data/models/random_forest_model.pkl')
    print("\nSaved trained model to data/models/random_forest_model.pkl")

    metrics_data = {
        "model": "RandomForestClassifier",
        "parameters": {
            "n_estimators": 100,
            "max_depth": 6,
            "class_weight": "balanced",
            "random_state": 42
        },
        "dataset": {
            "total_samples": len(df),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_cols,
            "classes": class_names,
            "class_counts": df['final_label'].value_counts().to_dict()
        },
        "overall_metrics": {
            "accuracy": float(acc),
            "precision_macro": float(prec_macro),
            "recall_macro": float(rec_macro),
            "f1_macro": float(f1_macro),
            "precision_weighted": float(prec_weighted),
            "recall_weighted": float(rec_weighted),
            "f1_weighted": float(f1_weighted),
            "cv_f1_weighted_mean": float(cv_scores.mean()),
            "cv_f1_weighted_std": float(cv_scores.std())
        },
        "per_class_metrics": clf_report,
        "feature_importances": importances.to_dict(),
        "confusion_matrix": conf_matrix.tolist()
    }

    with open('data/reports/random_forest_metrics.json', 'w', encoding='utf-8') as f:
        json.dump(metrics_data, f, indent=2)
    print("Saved evaluation metrics to data/reports/random_forest_metrics.json")

    # 10. Generate and Save Confusion Matrix Plot
    plt.figure(figsize=(8, 6))
    sns.heatmap(
        conf_matrix,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names,
        cbar=False
    )
    plt.title('Random Forest Baseline - Confusion Matrix (Test Set)', fontsize=14, pad=15)
    plt.xlabel('Predicted Label', fontsize=12)
    plt.ylabel('True Label', fontsize=12)
    plt.xticks(rotation=20, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    plt.savefig('data/reports/random_forest_confusion_matrix.png', dpi=300)
    plt.close()
    print("Saved confusion matrix plot to data/reports/random_forest_confusion_matrix.png")

if __name__ == '__main__':
    main()
