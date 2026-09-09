"""Configuration settings and constants for NASA FIRMS Data Pipeline."""

from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
REPORTS_DIR = BASE_DIR / "reports"

# Default File Paths
RAW_FIRMS_DEFAULT = RAW_DATA_DIR / "firms_raw.csv"
PROCESSED_FIRMS_DEFAULT = PROCESSED_DATA_DIR / "firms_cleaned.csv"
EDA_REPORT_DEFAULT = REPORTS_DIR / "firms_eda_report.json"

# Core Required Columns for FIRMS datasets
# (Supports standard MODIS and VIIRS columns)
REQUIRED_COLUMNS = [
    "latitude",
    "longitude",
    "acq_date",
    "acq_time"
]

# Coordinate boundary constraints (WGS84 EPSG:4326)
LATITUDE_MIN = -90.0
LATITUDE_MAX = 90.0
LONGITUDE_MIN = -180.0
LONGITUDE_MAX = 180.0

# Physical validity constraints
MIN_BRIGHTNESS_KELVIN = 0.0
MIN_FRP = 0.0

# Deduplication key columns (subset used to check duplicate hotspot detections)
DEDUPLICATION_COLUMNS = [
    "latitude",
    "longitude",
    "acq_date",
    "acq_time"
]
