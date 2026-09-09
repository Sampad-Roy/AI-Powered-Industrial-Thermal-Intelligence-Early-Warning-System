"""
SIH26162: Explainable & Transparent Multi-Factor Risk Scoring Engine
Calculates objective 0-100 risk scores for satellite thermal anomaly events.
Combines physical thermal severity, spatial industrial proximity, temporal persistence,
recurrence patterns, and ML model hazard predictions.
"""

from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import pandas as pd


# ---------------------------------------------------------
# Default System Weights & Class Hazard Multipliers
# ---------------------------------------------------------
DEFAULT_COMPONENT_WEIGHTS = {
    "thermal": 0.25,
    "proximity": 0.25,
    "ml_confidence": 0.25,
    "persistence": 0.15,
    "recurrence": 0.10
}

CLASS_HAZARD_WEIGHTS = {
    "Industrial Fire": 1.00,
    "Gas Flare": 0.85,
    "Persistent Industrial Heat": 0.65,
    "Other Thermal Source": 0.25,
    "Unknown": 0.50
}


def clip(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """Helper to clip numeric values strictly within [min_val, max_val]."""
    if pd.isna(value) or np.isnan(value):
        return min_val
    return float(np.clip(value, min_val, max_val))


def compute_thermal_score(
    frp: Optional[float] = 0.0,
    bright_ti4: Optional[float] = 300.0,
    bright_ti5: Optional[float] = 295.0,
    delta_t: Optional[float] = 0.0
) -> float:
    """
    Computes Thermal Severity Score (0-100).
    - FRP (0-40 pts): Linear scaling up to 30 MW.
    - Brightness TI4 (0-35 pts): Scaled between 295 K and 370 K.
    - Delta T (TI4 - TI5) (0-25 pts): Scaled between 0 K and 50 K.
    """
    frp_val = 0.0 if (frp is None or pd.isna(frp)) else max(0.0, float(frp))
    ti4_val = 300.0 if (bright_ti4 is None or pd.isna(bright_ti4)) else float(bright_ti4)
    dt_val = 0.0 if (delta_t is None or pd.isna(delta_t)) else max(0.0, float(delta_t))

    # 1. FRP component (max 40 pts)
    frp_pts = min(1.0, frp_val / 30.0) * 40.0

    # 2. Brightness TI4 component (max 35 pts)
    ti4_norm = np.clip((ti4_val - 295.0) / (370.0 - 295.0), 0.0, 1.0)
    ti4_pts = ti4_norm * 35.0

    # 3. Delta T sub-pixel combustion contrast (max 25 pts)
    dt_norm = np.clip(dt_val / 50.0, 0.0, 1.0)
    dt_pts = dt_norm * 25.0

    return clip(frp_pts + ti4_pts + dt_pts, 0.0, 100.0)


def compute_persistence_score(
    cluster_span_days: Optional[float] = 0.0,
    cluster_unique_dates: Optional[float] = 1.0
) -> float:
    """
    Computes Temporal Persistence Score (0-100).
    - Cluster Span Days (0-60 pts): Scaled between 0 and 80 days.
    - Cluster Unique Dates (0-40 pts): Scaled between 1 and 20 observation dates.
    """
    span_val = 0.0 if (cluster_span_days is None or pd.isna(cluster_span_days)) else max(0.0, float(cluster_span_days))
    dates_val = 1.0 if (cluster_unique_dates is None or pd.isna(cluster_unique_dates)) else max(1.0, float(cluster_unique_dates))

    span_pts = min(1.0, span_val / 80.0) * 60.0
    dates_pts = min(1.0, (dates_val - 1.0) / 19.0) * 40.0

    return clip(span_pts + dates_pts, 0.0, 100.0)


def compute_proximity_score(
    distance_to_industry: Optional[float] = 5000.0,
    industries_within_1km: Optional[float] = 0.0,
    industries_within_2km: Optional[float] = 0.0,
    ndbi: Optional[float] = 0.0
) -> float:
    """
    Computes Industrial Proximity Score (0-100).
    - Proximity to nearest industrial boundary (0-50 pts): Inverted decay from 5000m to 0m.
    - Regional Industrial Density (0-30 pts): Facilities in 1km (10 pts) and 2km (20 pts).
    - Surface Built-up NDBI (0-20 pts): Scaled from -0.20 to +0.30.
    """
    dist_val = 5000.0 if (distance_to_industry is None or pd.isna(distance_to_industry)) else max(0.0, float(distance_to_industry))
    ind_1k = 0.0 if (industries_within_1km is None or pd.isna(industries_within_1km)) else max(0.0, float(industries_within_1km))
    ind_2k = 0.0 if (industries_within_2km is None or pd.isna(industries_within_2km)) else max(0.0, float(industries_within_2km))
    ndbi_val = 0.0 if (ndbi is None or pd.isna(ndbi)) else float(ndbi)

    # Proximity component (max 50 pts)
    dist_pts = max(0.0, (5000.0 - dist_val) / 5000.0) * 50.0

    # Density component (max 30 pts)
    dens_2k_pts = min(1.0, ind_2k / 25.0) * 20.0
    dens_1k_pts = min(1.0, ind_1k / 10.0) * 10.0

    # NDBI component (max 20 pts)
    ndbi_norm = np.clip((ndbi_val - (-0.20)) / (0.30 - (-0.20)), 0.0, 1.0)
    ndbi_pts = ndbi_norm * 20.0

    return clip(dist_pts + dens_2k_pts + dens_1k_pts + ndbi_pts, 0.0, 100.0)


def compute_recurrence_score(
    cluster_event_count: Optional[float] = 1.0,
    daynight: Optional[int] = 1
) -> float:
    """
    Computes Recurrence Pattern Score (0-100).
    - Cluster Event Count (0-70 pts): Scaled from 1 to 25 detections within 500m.
    - Nocturnal / Diurnal Overpass (0-30 pts): Night detection (daynight=0) gets 30 pts.
    """
    count_val = 1.0 if (cluster_event_count is None or pd.isna(cluster_event_count)) else max(1.0, float(cluster_event_count))
    dn_val = 1 if (daynight is None or pd.isna(daynight)) else int(daynight)

    count_pts = min(1.0, (count_val - 1.0) / 24.0) * 70.0
    dn_pts = 30.0 if dn_val == 0 else 15.0

    return clip(count_pts + dn_pts, 0.0, 100.0)


def compute_ml_confidence_score(
    predicted_class: str = "Unknown",
    confidence: Optional[float] = 0.50
) -> float:
    """
    Computes ML Hazard Multiplier Score (0-100).
    - Predicted Class Hazard Weight (0.25 to 1.00) * Model Probability Confidence * 100.
    """
    conf_val = 0.50 if (confidence is None or pd.isna(confidence)) else np.clip(float(confidence), 0.0, 1.0)
    hazard_weight = CLASS_HAZARD_WEIGHTS.get(predicted_class, 0.50)
    return clip(hazard_weight * conf_val * 100.0, 0.0, 100.0)


def get_risk_level(score: float) -> str:
    """Maps a 0-100 risk score to standardized category levels."""
    s = clip(score, 0.0, 100.0)
    if s < 25.0:
        return "LOW"
    elif s < 50.0:
        return "MODERATE"
    elif s < 75.0:
        return "HIGH"
    else:
        return "CRITICAL"


def identify_top_risk_factors(row: Dict[str, Any]) -> str:
    """Produces human-interpretable reasons driving the event risk score."""
    factors = []
    
    frp = float(row.get("frp", row.get("FRP", 0.0)))
    dist = float(row.get("distance_to_industry", row.get("nearest_industry_distance_m", 5000.0)))
    span = float(row.get("cluster_span_days", 0.0))
    pred = str(row.get("predicted_class", "Unknown"))
    conf = float(row.get("confidence", 0.50))
    dt = float(row.get("delta_t", row.get("delta_ti4_ti5", 0.0)))
    ind_2k = float(row.get("industries_within_2km", 0.0))

    if pred == "Industrial Fire":
        factors.append(f"Acute Industrial Fire Hazard ({conf*100:.1f}% ML conf)")
    elif pred == "Gas Flare":
        factors.append(f"High-Temp Flare Combustion Stack ({conf*100:.1f}% ML conf)")
    elif pred == "Persistent Industrial Heat":
        factors.append(f"Chronic Operational Heat Source ({span:.0f}d persistence)")

    if frp >= 15.0:
        factors.append(f"Severe FRP Power Spike ({frp:.1f} MW)")
    elif frp >= 5.0:
        factors.append(f"Elevated Radiative Power ({frp:.1f} MW)")

    if dist <= 500.0:
        factors.append(f"Immediate Industrial Co-location ({dist:.0f}m)")
    elif dist <= 1200.0:
        factors.append(f"Close Industrial Proximity ({dist:.0f}m)")

    if ind_2k >= 15.0:
        factors.append(f"Dense Industrial Cluster ({ind_2k:.0f} facilities within 2km)")

    if dt >= 30.0:
        factors.append(f"Intense Sub-pixel Combustion Contrast (ΔT = {dt:.1f}K)")

    if not factors:
        factors.append("Nominal Rural / Non-Industrial Baseline")

    return "; ".join(factors[:3])


def evaluate_event_risk(
    event_data: Dict[str, Any],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, Any]:
    """
    Evaluates an individual thermal event record and returns all sub-scores and final risk.
    """
    w = weights if weights is not None else DEFAULT_COMPONENT_WEIGHTS

    thermal_score = compute_thermal_score(
        frp=event_data.get("frp", event_data.get("FRP")),
        bright_ti4=event_data.get("bright_ti4"),
        bright_ti5=event_data.get("bright_ti5"),
        delta_t=event_data.get("delta_t", event_data.get("delta_ti4_ti5"))
    )

    persistence_score = compute_persistence_score(
        cluster_span_days=event_data.get("cluster_span_days"),
        cluster_unique_dates=event_data.get("cluster_unique_dates")
    )

    proximity_score = compute_proximity_score(
        distance_to_industry=event_data.get("distance_to_industry", event_data.get("nearest_industry_distance_m")),
        industries_within_1km=event_data.get("industries_within_1km"),
        industries_within_2km=event_data.get("industries_within_2km"),
        ndbi=event_data.get("NDBI")
    )

    recurrence_score = compute_recurrence_score(
        cluster_event_count=event_data.get("cluster_event_count"),
        daynight=event_data.get("daynight")
    )

    pred_class = event_data.get("predicted_class", "Unknown")
    conf_val = event_data.get("confidence", 0.50)

    ml_score = compute_ml_confidence_score(
        predicted_class=pred_class,
        confidence=conf_val
    )

    # Weighted Composite Sum
    final_score = (
        w["thermal"] * thermal_score +
        w["proximity"] * proximity_score +
        w["ml_confidence"] * ml_score +
        w["persistence"] * persistence_score +
        w["recurrence"] * recurrence_score
    )
    final_score = clip(round(final_score, 2), 0.0, 100.0)
    risk_level = get_risk_level(final_score)

    top_factors = identify_top_risk_factors({
        **event_data,
        "predicted_class": pred_class,
        "confidence": conf_val
    })

    return {
        "event_id": event_data.get("event_id"),
        "predicted_class": pred_class,
        "confidence": round(float(conf_val), 4),
        "thermal_score": round(thermal_score, 2),
        "persistence_score": round(persistence_score, 2),
        "industrial_proximity_score": round(proximity_score, 2),
        "recurrence_score": round(recurrence_score, 2),
        "ml_confidence_score": round(ml_score, 2),
        "final_risk_score": final_score,
        "risk_level": risk_level,
        "top_risk_factors": top_factors
    }


def compute_dataset_risk_scores(
    df: pd.DataFrame,
    predictions: Optional[np.ndarray] = None,
    probabilities: Optional[np.ndarray] = None,
    class_names: Optional[List[str]] = None,
    weights: Optional[Dict[str, float]] = None
) -> pd.DataFrame:
    """Processes a full DataFrame of events and computes risk metrics."""
    records = []
    
    for i, (_, row) in enumerate(df.iterrows()):
        event_dict = row.to_dict()
        
        if predictions is not None and class_names is not None:
            pred_idx = predictions[i]
            event_dict["predicted_class"] = class_names[pred_idx]
            if probabilities is not None:
                event_dict["confidence"] = probabilities[i][pred_idx]
            else:
                event_dict["confidence"] = 1.0
        elif "final_label" in event_dict and "predicted_class" not in event_dict:
            event_dict["predicted_class"] = event_dict["final_label"]
            event_dict["confidence"] = 1.0
            
        res = evaluate_event_risk(event_dict, weights=weights)
        records.append(res)
        
    return pd.DataFrame(records)
