"""NASA FIRMS Data Cleaner Module.

Handles data cleaning operations:
- Parsing and standardizing acquisition date and time into unified datetime.
- Removing duplicate records (both exact duplicates and spatiotemporal duplicates).
- Handling missing and corrupted values without fabricating data or labels.
- Saving processed data to disk.
"""

import logging
from pathlib import Path
from typing import Optional, List, Tuple, Dict, Any, Union
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


def parse_firms_datetime(
    df: pd.DataFrame,
    date_col: str = "acq_date",
    time_col: str = "acq_time",
    output_col: str = "acq_datetime"
) -> pd.DataFrame:
    """Parses and combines FIRMS date (YYYY-MM-DD) and time (HHMM / integer) into UTC datetime.

    Args:
        df: Input DataFrame.
        date_col: Name of acquisition date column.
        time_col: Name of acquisition time column.
        output_col: Name of resulting datetime column.

    Returns:
        pd.DataFrame: DataFrame with the new parsed datetime column.
    """
    df = df.copy()

    # Ensure acq_date is formatted as string
    date_str = df[date_col].astype(str).str.strip()

    # Format acq_time into 4-digit string HHMM (e.g., 345 -> '0345', '1420' -> '1420')
    time_str = (
        df[time_col]
        .astype(str)
        .str.replace(r"\.0$", "", regex=True)
        .str.strip()
        .str.zfill(4)
    )

    # Combine into standard format: YYYY-MM-DD HH:MM
    datetime_str = date_str + " " + time_str.str.slice(0, 2) + ":" + time_str.str.slice(2, 4)

    # Parse to datetime (coerce errors to NaT)
    df[output_col] = pd.to_datetime(datetime_str, errors="coerce", utc=True)
    
    invalid_dates_count = df[output_col].isna().sum()
    if invalid_dates_count > 0:
        logger.warning(f"{invalid_dates_count:,} records had unparseable date/time and were assigned NaT.")
    else:
        logger.info(f"Successfully parsed {len(df):,} date/time records into '{output_col}'.")

    return df


def remove_duplicates(
    df: pd.DataFrame,
    subset_cols: Optional[List[str]] = None
) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Removes duplicate hotspot records from the dataset.

    Args:
        df: Input DataFrame.
        subset_cols: Column names to consider for identifying duplicates.
                     If None, checks all columns first, then falls back to spatiotemporal keys.

    Returns:
        Tuple[pd.DataFrame, Dict[str, int]]: (deduplicated_df, stats_dict)
    """
    initial_count = len(df)
    
    # 1. Exact duplicates across all columns
    exact_duplicates = df.duplicated()
    exact_count = int(exact_duplicates.sum())
    df_no_exact = df[~exact_duplicates].copy()

    # 2. Key-based duplicates (e.g. same latitude, longitude, acq_datetime / acq_date + acq_time)
    if subset_cols is None:
        possible_keys = ["latitude", "longitude", "acq_datetime", "acq_date", "acq_time", "satellite", "instrument"]
        subset_cols = [c for c in possible_keys if c in df_no_exact.columns]

    key_duplicates_count = 0
    if subset_cols:
        key_duplicates = df_no_exact.duplicated(subset=subset_cols, keep="first")
        key_duplicates_count = int(key_duplicates.sum())
        clean_df = df_no_exact[~key_duplicates].copy()
    else:
        clean_df = df_no_exact

    total_removed = initial_count - len(clean_df)
    stats = {
        "initial_records": initial_count,
        "exact_duplicates_removed": exact_count,
        "spatiotemporal_duplicates_removed": key_duplicates_count,
        "total_duplicates_removed": total_removed,
        "final_records": len(clean_df)
    }

    logger.info(
        f"Deduplication complete: Removed {exact_count:,} exact and "
        f"{key_duplicates_count:,} spatiotemporal duplicates. "
        f"Remaining records: {len(clean_df):,}."
    )

    return clean_df, stats


def handle_missing_values(
    df: pd.DataFrame,
    critical_cols: Optional[List[str]] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Handles missing values without fabricating synthetic data or fake labels.

    Drops records where essential geospatial/temporal coordinates are missing.
    Standardizes categorical text columns (e.g. confidence strings, daynight).

    Args:
        df: Input DataFrame.
        critical_cols: List of columns that cannot have missing/null values.

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: (cleaned_df, missing_stats)
    """
    if critical_cols is None:
        critical_cols = [c for c in ["latitude", "longitude", "acq_date", "acq_time", "acq_datetime"] if c in df.columns]

    initial_count = len(df)
    missing_per_col = df.isna().sum().to_dict()

    # Drop records with missing critical geospatial or temporal attributes
    valid_critical_mask = df[critical_cols].notna().all(axis=1)
    dropped_critical = initial_count - int(valid_critical_mask.sum())

    clean_df = df[valid_critical_mask].copy()

    # Standardize string fields if present
    if "daynight" in clean_df.columns:
        clean_df["daynight"] = clean_df["daynight"].astype(str).str.strip().str.upper()
    if "confidence" in clean_df.columns:
        # If confidence is string-based (e.g., VIIRS 'l', 'n', 'h'), normalize case
        if clean_df["confidence"].dtype == object:
            clean_df["confidence"] = clean_df["confidence"].astype(str).str.strip().str.lower()

    stats = {
        "initial_records": initial_count,
        "missing_per_column": missing_per_col,
        "dropped_missing_critical_records": dropped_critical,
        "remaining_records": len(clean_df)
    }

    if dropped_critical > 0:
        logger.warning(f"Dropped {dropped_critical:,} records missing critical fields ({critical_cols}).")
    else:
        logger.info("No critical missing values found.")

    return clean_df, stats


def clean_firms_data(
    df: pd.DataFrame,
    output_path: Optional[Union[str, Path]] = None
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Executes the full data cleaning pipeline on a raw FIRMS DataFrame.

    Steps:
    1. Parse and format date and time to `acq_datetime`.
    2. Handle missing critical fields.
    3. Remove duplicate records.
    4. Reset index.
    5. Optionally save to `data/processed/firms_cleaned.csv`.

    Args:
        df: Raw or validated FIRMS DataFrame.
        output_path: Optional file path to save the cleaned CSV.

    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: (cleaned_df, summary_stats)
    """
    logger.info(f"Starting FIRMS data cleaning on {len(df):,} records...")
    cleaning_stats: Dict[str, Any] = {"raw_record_count": len(df)}

    # Step 1: Parse Datetime
    df_dt = parse_firms_datetime(df)

    # Step 2: Handle Missing Values
    df_no_missing, missing_stats = handle_missing_values(df_dt)
    cleaning_stats["missing_stats"] = missing_stats

    # Step 3: Remove Duplicates
    df_dedup, dedup_stats = remove_duplicates(df_no_missing)
    cleaning_stats["dedup_stats"] = dedup_stats

    # Final cleanup: reset index
    cleaned_df = df_dedup.reset_index(drop=True)
    cleaning_stats["final_record_count"] = len(cleaned_df)

    # Step 4: Save to CSV if requested
    if output_path is not None:
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        cleaned_df.to_csv(out_p, index=False)
        logger.info(f"Saved cleaned dataset to: {out_p} ({len(cleaned_df):,} records)")
        cleaning_stats["output_file"] = str(out_p)

    return cleaned_df, cleaning_stats
