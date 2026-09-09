"""NASA FIRMS End-to-End Data Pipeline Orchestrator.

Combines loading, schema validation, coordinate verification, physical range validation,
cleaning, deduplication, datetime parsing, saving, and EDA summary generation into a single execution workflow.
"""

import logging
from pathlib import Path
from typing import Optional, Union, Dict, Any
import pandas as pd

from configs.config import (
    RAW_FIRMS_DEFAULT,
    PROCESSED_FIRMS_DEFAULT,
    EDA_REPORT_DEFAULT,
    REQUIRED_COLUMNS,
    LATITUDE_MIN,
    LATITUDE_MAX,
    LONGITUDE_MIN,
    LONGITUDE_MAX,
    MIN_BRIGHTNESS_KELVIN,
    MIN_FRP
)
from .firms_loader import load_firms_data
from .firms_validator import validate_firms_schema, validate_coordinates, validate_physical_values
from .firms_cleaner import clean_firms_data
from .firms_eda import generate_eda_summary, print_eda_report, save_eda_report

logger = logging.getLogger(__name__)


def run_firms_pipeline(
    raw_csv_path: Union[str, Path] = RAW_FIRMS_DEFAULT,
    processed_csv_path: Union[str, Path] = PROCESSED_FIRMS_DEFAULT,
    eda_report_path: Optional[Union[str, Path]] = EDA_REPORT_DEFAULT,
    generate_report: bool = True
) -> Dict[str, Any]:
    """Runs the complete NASA FIRMS data processing pipeline.

    Args:
        raw_csv_path: Path to raw input FIRMS CSV.
        processed_csv_path: Path where the cleaned dataset should be saved.
        eda_report_path: Path where the EDA JSON report should be saved.
        generate_report: Whether to compute and print the EDA report.

    Returns:
        Dict[str, Any]: Execution results containing cleaned DataFrame and EDA metrics.
    """
    logger.info("==================================================")
    logger.info("  STARTING NASA FIRMS DATA PIPELINE (SIH 2026)")
    logger.info("==================================================")

    # 1. Ingestion / Loading
    df_raw = load_firms_data(raw_csv_path)

    # 2. Schema Validation
    is_valid_schema, missing_cols = validate_firms_schema(df_raw, required_columns=REQUIRED_COLUMNS)
    if not is_valid_schema:
        raise ValueError(f"Schema validation failed! Missing required columns: {missing_cols}")

    # 3. Coordinate Bounds Validation
    df_geo_valid, geo_stats = validate_coordinates(
        df_raw,
        lat_bounds=(LATITUDE_MIN, LATITUDE_MAX),
        lon_bounds=(LONGITUDE_MIN, LONGITUDE_MAX)
    )

    # 4. Physical Values Validation
    df_phys_valid, phys_stats = validate_physical_values(
        df_geo_valid,
        min_kelvin=MIN_BRIGHTNESS_KELVIN,
        min_frp=MIN_FRP
    )

    # 5. Cleaning, Deduplication, Datetime Parsing & Output
    df_cleaned, clean_stats = clean_firms_data(df_phys_valid, output_path=processed_csv_path)

    # 6. Exploratory Data Analysis & Reporting
    eda_summary = {}
    if generate_report:
        logger.info("Generating Exploratory Data Analysis (EDA) summary...")
        eda_summary = generate_eda_summary(df_cleaned, report_title="NASA FIRMS Cleaned Dataset EDA")
        print_eda_report(eda_summary)
        
        if eda_report_path:
            save_eda_report(
                summary=eda_summary,
                output_json_path=eda_report_path,
                output_md_path=Path(eda_report_path).with_suffix(".md")
            )

    logger.info("==================================================")
    logger.info(f"  PIPELINE FINISHED SUCCESSFULLY!")
    logger.info(f"  Processed dataset saved to: {processed_csv_path}")
    logger.info("==================================================")

    return {
        "df_cleaned": df_cleaned,
        "clean_stats": clean_stats,
        "geo_stats": geo_stats,
        "phys_stats": phys_stats,
        "eda_summary": eda_summary
    }
