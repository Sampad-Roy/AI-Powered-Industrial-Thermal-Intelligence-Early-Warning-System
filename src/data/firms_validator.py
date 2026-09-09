"""NASA FIRMS Data Validator Module.

Responsible for validating schema, coordinate bounds (latitude/longitude),
data types, and physical sensor ranges (brightness temperatures, FRP).
"""

import logging
from typing import List, Optional, Tuple, Dict, Any
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def validate_firms_schema(
    df: pd.DataFrame,
    required_columns: Optional[List[str]] = None
) -> Tuple[bool, List[str]]:
    """Validates that all required columns are present in the DataFrame.

    Args:
        df: Input DataFrame.
        required_columns: List of column names that must exist.

    Returns:
        Tuple[bool, List[str]]: (is_valid, missing_columns)
    """
    if required_columns is None:
        required_columns = ["latitude", "longitude", "acq_date", "acq_time"]

    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        logger.error(f"Schema validation failed. Missing required columns: {missing}")
        return False, missing

    logger.info(f"Schema validation passed. All required columns present: {required_columns}")
    return True, []


def validate_coordinates(
    df: pd.DataFrame,
    lat_col: str = "latitude",
    lon_col: str = "longitude",
    lat_bounds: Tuple[float, float] = (-90.0, 90.0),
    lon_bounds: Tuple[float, float] = (-180.0, 180.0)
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Validates and filters records with valid WGS84 geographic coordinates.

    Args:
        df: Input DataFrame.
        lat_col: Name of latitude column.
        lon_col: Name of longitude column.
        lat_bounds: (min_lat, max_lat).
        lon_bounds: (min_lon, max_lon).

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: (valid_df, stats_dict)
    """
    initial_count = len(df)
    
    # Ensure numeric types
    lat_series = pd.to_numeric(df[lat_col], errors="coerce")
    lon_series = pd.to_numeric(df[lon_col], errors="coerce")

    # Geographic bounds condition
    valid_lat = lat_series.between(lat_bounds[0], lat_bounds[1], inclusive="both")
    valid_lon = lon_series.between(lon_bounds[0], lon_bounds[1], inclusive="both")
    valid_coords_mask = valid_lat & valid_lon & (~lat_series.isna()) & (~lon_series.isna())

    invalid_count = initial_count - int(valid_coords_mask.sum())
    
    stats = {
        "initial_records": initial_count,
        "valid_coordinate_records": int(valid_coords_mask.sum()),
        "invalid_coordinate_records": invalid_count,
        "lat_range": (float(lat_series[valid_coords_mask].min()), float(lat_series[valid_coords_mask].max())) if valid_coords_mask.any() else (None, None),
        "lon_range": (float(lon_series[valid_coords_mask].min()), float(lon_series[valid_coords_mask].max())) if valid_coords_mask.any() else (None, None)
    }

    if invalid_count > 0:
        logger.warning(f"Found {invalid_count:,} records with invalid/missing coordinates. Removing them.")
    else:
        logger.info("All geographic coordinates are valid.")

    valid_df = df[valid_coords_mask].copy()
    valid_df[lat_col] = lat_series[valid_coords_mask]
    valid_df[lon_col] = lon_series[valid_coords_mask]

    return valid_df, stats


def validate_physical_values(
    df: pd.DataFrame,
    min_kelvin: float = 0.0,
    min_frp: float = 0.0
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Validates physical sensor attributes such as FRP (>= 0) and Brightness (> 0 Kelvin).

    Args:
        df: Input DataFrame.
        min_kelvin: Minimum valid temperature in Kelvin.
        min_frp: Minimum valid Fire Radiative Power (MW).

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: (valid_df, stats_dict)
    """
    initial_count = len(df)
    mask = pd.Series(True, index=df.index)
    stats: Dict[str, Any] = {"initial_records": initial_count}

    # Check FRP if present
    frp_cols = [c for c in df.columns if c in ("frp", "frp_mw")]
    if frp_cols:
        frp_col = frp_cols[0]
        frp_num = pd.to_numeric(df[frp_col], errors="coerce")
        invalid_frp = (frp_num < min_frp)
        stats["invalid_frp_count"] = int(invalid_frp.sum())
        mask = mask & (~invalid_frp | frp_num.isna())

    # Check Brightness columns (MODIS: brightness, bright_t31; VIIRS: bright_ti4, bright_ti5)
    brightness_cols = [c for c in df.columns if "bright" in c]
    for bcol in brightness_cols:
        b_num = pd.to_numeric(df[bcol], errors="coerce")
        invalid_b = (b_num <= min_kelvin)
        stats[f"invalid_{bcol}_count"] = int(invalid_b.sum())
        mask = mask & (~invalid_b | b_num.isna())

    valid_count = int(mask.sum())
    stats["retained_records"] = valid_count
    stats["filtered_out"] = initial_count - valid_count

    if stats["filtered_out"] > 0:
        logger.warning(f"Filtered out {stats['filtered_out']:,} records violating physical value constraints.")
    else:
        logger.info("Physical value constraints validated successfully.")

    return df[mask].copy(), stats
