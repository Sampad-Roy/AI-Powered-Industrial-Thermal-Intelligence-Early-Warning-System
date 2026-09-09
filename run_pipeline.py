"""Top-level CLI execution script for NASA FIRMS Data Pipeline (Phase 1).

Usage:
    # 1. Using a local downloaded CSV:
    python run_pipeline.py --input data/raw/firms_raw.csv --output data/processed/firms_cleaned.csv

    # 2. Fetching directly from NASA FIRMS API via MAP_KEY:
    python run_pipeline.py --map-key <YOUR_32_CHAR_MAP_KEY> --country IND --sensor VIIRS_SNPP_NRT
"""

import sys
import argparse
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from configs.config import RAW_FIRMS_DEFAULT, PROCESSED_FIRMS_DEFAULT, EDA_REPORT_DEFAULT
from src.data.pipeline import run_firms_pipeline
from src.data.firms_downloader import download_firms_nrt_data


def parse_args():
    parser = argparse.ArgumentParser(
        description="Phase 1: NASA FIRMS Thermal Hotspot Data Pipeline (SIH 2026)"
    )
    parser.add_argument(
        "-i", "--input",
        type=str,
        default=str(RAW_FIRMS_DEFAULT),
        help=f"Path to input raw FIRMS CSV file (default: {RAW_FIRMS_DEFAULT})"
    )
    parser.add_argument(
        "-o", "--output",
        type=str,
        default=str(PROCESSED_FIRMS_DEFAULT),
        help=f"Path to output cleaned CSV file (default: {PROCESSED_FIRMS_DEFAULT})"
    )
    parser.add_argument(
        "-r", "--report",
        type=str,
        default=str(EDA_REPORT_DEFAULT),
        help=f"Path to output EDA JSON report (default: {EDA_REPORT_DEFAULT})"
    )
    parser.add_argument(
        "--map-key",
        type=str,
        default=None,
        help="Optional NASA FIRMS MAP_KEY to fetch latest data directly from NASA API"
    )
    parser.add_argument(
        "--country",
        type=str,
        default="IND",
        help="Country code for NASA FIRMS API download (default: IND)"
    )
    parser.add_argument(
        "--sensor",
        type=str,
        default="VIIRS_SNPP_NRT",
        choices=["VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT", "VIIRS_NOAA21_NRT", "MODIS_NRT"],
        help="Sensor source for API download (default: VIIRS_SNPP_NRT)"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="Days of NRT data to fetch from API (1-10, default: 1)"
    )
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Disable EDA report generation"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)
    report_path = Path(args.report) if not args.no_report else None

    # If map_key is provided, download data first
    if args.map_key:
        print(f"\n[INFO] Downloading NASA FIRMS active fire data via API for country '{args.country}'...")
        try:
            download_firms_nrt_data(
                map_key=args.map_key,
                source=args.sensor,
                country_code=args.country,
                day_range=args.days,
                output_path=input_path
            )
        except Exception as e:
            print(f"\n[DOWNLOAD ERROR] Failed to fetch data from NASA FIRMS API: {e}")
            sys.exit(1)

    if not input_path.exists():
        print(f"\n[ERROR] Input file not found: {input_path}")
        print("\nPlease place your NASA FIRMS CSV dataset in data/raw/ or specify via:")
        print(f"  python run_pipeline.py --input <path_to_firms_csv>")
        print("  or fetch live data via NASA API: python run_pipeline.py --map-key <KEY>\n")
        sys.exit(1)

    try:
        run_firms_pipeline(
            raw_csv_path=input_path,
            processed_csv_path=output_path,
            eda_report_path=report_path,
            generate_report=not args.no_report
        )
    except Exception as e:
        print(f"\n[PIPELINE FAILURE] An error occurred during execution: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
