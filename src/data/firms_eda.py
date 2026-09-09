"""NASA FIRMS Exploratory Data Analysis (EDA) Module.

Computes statistical profiles and distribution metrics for thermal hotspot data:
- Number of records
- Missing values per column
- Duplicates count
- Date and time ranges
- Latitude and Longitude bounding ranges
- FRP (Fire Radiative Power) distribution
- Brightness temperature distribution
- Confidence distribution
- Generates structured EDA reports (console / markdown / JSON).
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def compute_distribution_stats(series: pd.Series) -> Dict[str, Any]:
    """Computes distribution statistics for a numeric pandas Series.

    Args:
        series: Numeric series.

    Returns:
        Dict[str, Any]: Statistical metrics (count, mean, std, min, 25%, 50%, 75%, max, skewness).
    """
    clean_series = pd.to_numeric(series, errors="coerce").dropna()
    if len(clean_series) == 0:
        return {"count": 0, "status": "No numeric data available"}

    return {
        "count": int(len(clean_series)),
        "mean": round(float(clean_series.mean()), 4),
        "std": round(float(clean_series.std()), 4) if len(clean_series) > 1 else 0.0,
        "min": round(float(clean_series.min()), 4),
        "q25": round(float(clean_series.quantile(0.25)), 4),
        "median": round(float(clean_series.median()), 4),
        "q75": round(float(clean_series.quantile(0.75)), 4),
        "max": round(float(clean_series.max()), 4),
        "skewness": round(float(clean_series.skew()), 4) if len(clean_series) > 2 else 0.0
    }


def generate_eda_summary(
    df: pd.DataFrame,
    report_title: str = "NASA FIRMS Thermal Hotspot EDA Report"
) -> Dict[str, Any]:
    """Generates a comprehensive EDA summary dictionary for a FIRMS dataset.

    Args:
        df: Input FIRMS DataFrame.
        report_title: Title for the summary.

    Returns:
        Dict[str, Any]: Comprehensive EDA summary.
    """
    total_records = len(df)
    
    # 1. Missing Values
    missing_counts = df.isna().sum().to_dict()
    missing_percentages = {col: round((count / total_records) * 100, 2) if total_records > 0 else 0.0 for col, count in missing_counts.items()}

    # 2. Duplicates
    exact_duplicates_count = int(df.duplicated().sum())

    # 3. Geospatial Bounding Box
    lat_col = next((c for c in ["latitude", "lat"] if c in df.columns), None)
    lon_col = next((c for c in ["longitude", "lon", "long"] if c in df.columns), None)

    geo_bounds = {}
    if lat_col and lon_col:
        lats = pd.to_numeric(df[lat_col], errors="coerce").dropna()
        lons = pd.to_numeric(df[lon_col], errors="coerce").dropna()
        if len(lats) > 0 and len(lons) > 0:
            geo_bounds = {
                "latitude_min": round(float(lats.min()), 5),
                "latitude_max": round(float(lats.max()), 5),
                "longitude_min": round(float(lons.min()), 5),
                "longitude_max": round(float(lons.max()), 5)
            }

    # 4. Temporal Range
    dt_col = next((c for c in ["acq_datetime", "acq_date"] if c in df.columns), None)
    date_range = {}
    if dt_col:
        parsed_dates = pd.to_datetime(df[dt_col], errors="coerce").dropna()
        if len(parsed_dates) > 0:
            date_range = {
                "start_date": str(parsed_dates.min()),
                "end_date": str(parsed_dates.max()),
                "total_days_span": int((parsed_dates.max() - parsed_dates.min()).days) + 1
            }

    # 5. FRP Distribution
    frp_col = next((c for c in ["frp", "frp_mw"] if c in df.columns), None)
    frp_stats = compute_distribution_stats(df[frp_col]) if frp_col else {}

    # 6. Brightness Temperature Distributions
    brightness_stats = {}
    brightness_cols = [c for c in df.columns if "bright" in c]
    for bcol in brightness_cols:
        brightness_stats[bcol] = compute_distribution_stats(df[bcol])

    # 7. Confidence Distribution
    conf_stats = {}
    if "confidence" in df.columns:
        conf_series = df["confidence"]
        if pd.api.types.is_numeric_dtype(conf_series):
            conf_stats = {
                "type": "numeric",
                "distribution": compute_distribution_stats(conf_series)
            }
        else:
            # Categorical confidence (e.g., VIIRS 'low', 'nominal', 'high' or 'l', 'n', 'h')
            val_counts = conf_series.value_counts(dropna=False).to_dict()
            conf_stats = {
                "type": "categorical",
                "frequencies": {str(k): int(v) for k, v in val_counts.items()},
                "percentages": {str(k): round((v / total_records) * 100, 2) for k, v in val_counts.items()} if total_records > 0 else {}
            }

    # 8. Sensor and Satellite Breakdown
    meta_breakdown = {}
    for col in ["satellite", "instrument", "daynight", "version"]:
        if col in df.columns:
            meta_breakdown[col] = {str(k): int(v) for k, v in df[col].value_counts().items()}

    summary = {
        "title": report_title,
        "total_records": total_records,
        "total_columns": len(df.columns),
        "column_names": list(df.columns),
        "exact_duplicates": exact_duplicates_count,
        "missing_values": {
            "counts": missing_counts,
            "percentages": missing_percentages
        },
        "date_range": date_range,
        "geospatial_bounds": geo_bounds,
        "frp_distribution": frp_stats,
        "brightness_distribution": brightness_stats,
        "confidence_distribution": conf_stats,
        "satellite_metadata": meta_breakdown
    }

    return summary


def print_eda_report(summary: Dict[str, Any]) -> str:
    """Prints and returns a formatted text / markdown summary of the EDA report.

    Args:
        summary: Dictionary returned by generate_eda_summary.

    Returns:
        str: Formatted markdown report string.
    """
    lines = []
    lines.append("=" * 70)
    lines.append(f"  {summary.get('title', 'NASA FIRMS EDA REPORT')}")
    lines.append("=" * 70)
    lines.append(f"• Total Records: {summary['total_records']:,}")
    lines.append(f"• Total Features: {summary['total_columns']}")
    lines.append(f"• Columns: {', '.join(summary['column_names'])}")
    lines.append(f"• Exact Duplicate Records: {summary['exact_duplicates']:,}")

    # Temporal
    dr = summary.get("date_range", {})
    if dr:
        lines.append(f"• Date Range: {dr.get('start_date')} to {dr.get('end_date')} ({dr.get('total_days_span')} days)")

    # Geospatial
    gb = summary.get("geospatial_bounds", {})
    if gb:
        lines.append(
            f"• Latitude Range: [{gb.get('latitude_min')}, {gb.get('latitude_max')}] | "
            f"Longitude Range: [{gb.get('longitude_min')}, {gb.get('longitude_max')}]"
        )

    # Missing values
    lines.append("\n--- Missing Values Breakdown ---")
    missing_counts = summary.get("missing_values", {}).get("counts", {})
    missing_pcts = summary.get("missing_values", {}).get("percentages", {})
    has_missing = False
    for col, count in missing_counts.items():
        if count > 0:
            has_missing = True
            lines.append(f"  - {col}: {count:,} missing ({missing_pcts.get(col, 0)}%)")
    if not has_missing:
        lines.append("  (No missing values found across all columns)")

    # FRP stats
    frp = summary.get("frp_distribution", {})
    if frp and "mean" in frp:
        lines.append("\n--- FRP (Fire Radiative Power in MW) Distribution ---")
        lines.append(f"  - Min: {frp['min']} MW | Median: {frp['median']} MW | Max: {frp['max']} MW")
        lines.append(f"  - Mean: {frp['mean']} ± {frp['std']} MW | IQR: [{frp['q25']}, {frp['q75']}] MW | Skewness: {frp['skewness']}")

    # Brightness stats
    brights = summary.get("brightness_distribution", {})
    if brights:
        lines.append("\n--- Brightness Temperature (Kelvin) Distribution ---")
        for bcol, bstat in brights.items():
            if "mean" in bstat:
                lines.append(f"  - {bcol}: Min={bstat['min']}K, Median={bstat['median']}K, Max={bstat['max']}K, Mean={bstat['mean']}K")

    # Confidence stats
    conf = summary.get("confidence_distribution", {})
    if conf:
        lines.append("\n--- Detection Confidence Distribution ---")
        if conf.get("type") == "numeric":
            d = conf.get("distribution", {})
            lines.append(f"  - Numeric: Min={d.get('min')}, Median={d.get('median')}, Max={d.get('max')}, Mean={d.get('mean')}")
        elif conf.get("type") == "categorical":
            freqs = conf.get("frequencies", {})
            pcts = conf.get("percentages", {})
            for k, v in freqs.items():
                lines.append(f"  - Level '{k}': {v:,} ({pcts.get(k, 0)}%)")

    # Metadata breakdown
    meta = summary.get("satellite_metadata", {})
    if meta:
        lines.append("\n--- Satellite & Sensor Breakdown ---")
        for col, counts in meta.items():
            items_str = ", ".join([f"{k}: {v:,}" for k, v in counts.items()])
            lines.append(f"  - {col}: {items_str}")

    lines.append("=" * 70)
    report_text = "\n".join(lines)
    print(report_text)
    return report_text


def save_eda_report(
    summary: Dict[str, Any],
    output_json_path: Union[str, Path],
    output_md_path: Optional[Union[str, Path]] = None
) -> None:
    """Saves the computed EDA summary to a JSON file and optionally a Markdown file.

    Args:
        summary: Dictionary returned by generate_eda_summary.
        output_json_path: Path to output JSON.
        output_md_path: Optional path to output Markdown.
    """
    json_path = Path(output_json_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)
    logger.info(f"Saved EDA report JSON to: {json_path}")

    if output_md_path:
        md_path = Path(output_md_path)
        md_path.parent.mkdir(parents=True, exist_ok=True)
        report_text = print_eda_report(summary)
        with open(md_path, "w", encoding="utf-8") as f:
            f.write(f"# NASA FIRMS EDA Report\n\n```text\n{report_text}\n```\n")
        logger.info(f"Saved EDA report Markdown to: {md_path}")
