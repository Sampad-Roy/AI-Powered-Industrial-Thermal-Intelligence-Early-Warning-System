# NASA FIRMS Thermal Hotspot Data Pipeline

### SIH 2026 Project:
**"AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM and Satellite Data"**

---

## 📌 Overview

This repository contains the data engineering pipeline and exploratory data analysis (EDA) framework for processing **NASA FIRMS (Fire Information for Resource Management System)** thermal hotspot datasets.

The pipeline ingests raw satellite observations (MODIS and VIIRS), validates geographic bounds and physical sensor values, cleanses anomalies and duplicates, parses UTC timestamps, and outputs standard cleaned datasets for downstream spatial-temporal clustering, OSM cross-referencing, and persistent thermal source classification.

---

## 🗂️ Project Directory Structure

```text
SIH 26/
├── configs/
│   └── config.py               # Central configuration, paths, and boundary thresholds
├── data/
│   ├── raw/                    # Raw NASA FIRMS CSV downloads (e.g., MODIS/VIIRS)
│   └── processed/              # Cleaned output datasets (firms_cleaned.csv)
├── notebooks/
│   └── 01_firms_eda.ipynb      # Interactive EDA notebook with distribution plots
├── reports/                    # Generated EDA summary reports (JSON/Markdown)
├── src/
│   └── data/
│       ├── __init__.py         # Package interface
│       ├── firms_loader.py     # Ingestion and header normalization
│       ├── firms_validator.py  # Geographic coordinates and physical bounds validation
│       ├── firms_cleaner.py    # Deduplication, missing value handling, UTC datetime parsing
│       ├── firms_eda.py        # EDA statistical computation and report generation
│       └── pipeline.py         # End-to-end orchestration workflow
├── tests/
│   └── test_firms_pipeline.py  # Comprehensive unit and integration test suite
├── requirements.txt            # Python dependencies
├── run_pipeline.py             # CLI runner script
└── README.md                   # Documentation and module explanations
```

---

## ⚙️ Module Responsibilities

### 1. `src/data/firms_loader.py`
- **Purpose**: Ingestion of raw FIRMS CSV datasets.
- **Key Functions**:
  - `load_firms_data(file_path)`: Reads CSV files with Pandas, handles encoding, and normalizes column headers (lowercase, stripped whitespace).

### 2. `src/data/firms_validator.py`
- **Purpose**: Schema and data integrity verification.
- **Key Functions**:
  - `validate_firms_schema(df)`: Verifies presence of essential columns (`latitude`, `longitude`, `acq_date`, `acq_time`).
  - `validate_coordinates(df)`: Enforces valid WGS84 geographic boundaries ($-90 \le \text{lat} \le 90$, $-180 \le \text{lon} \le 180$) and removes out-of-bounds rows.
  - `validate_physical_values(df)`: Ensures brightness temperatures ($> 0\text{ K}$) and Fire Radiative Power ($\text{FRP} \ge 0\text{ MW}$) are physically valid.

### 3. `src/data/firms_cleaner.py`
- **Purpose**: Cleansing, deduplication, and timestamp synthesis.
- **Key Functions**:
  - `parse_firms_datetime(df)`: Converts separate `acq_date` (YYYY-MM-DD) and `acq_time` (HHMM integer/string) into a standard UTC timestamp (`acq_datetime`).
  - `remove_duplicates(df)`: Identifies and removes exact duplicate records as well as spatiotemporal duplicates.
  - `handle_missing_values(df)`: Drops records missing critical coordinates without fabricating synthetic data or fake labels. Standardizes categorical fields.
  - `clean_firms_data(df, output_path)`: Orchestrates cleaning and exports results to `data/processed/firms_cleaned.csv`.

### 4. `src/data/firms_eda.py`
- **Purpose**: Exploratory Data Analysis & Statistical Profiling.
- **Key Functions**:
  - `compute_distribution_stats(series)`: Computes count, mean, std, min, 25%, median, 75%, max, and skewness.
  - `generate_eda_summary(df)`: Generates full metrics summary for records, missing values, duplicates, date range, bounding boxes, FRP, brightness, and confidence distributions.
  - `print_eda_report(summary)`: Formats and prints human-readable EDA summaries.
  - `save_eda_report(summary, output_path)`: Exports report to JSON/Markdown.

### 5. `src/data/pipeline.py` & `run_pipeline.py`
- **Purpose**: End-to-end execution pipeline and CLI entrypoint.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Place Raw FIRMS Data
Download thermal hotspot data from [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) (MODIS C6.1 or VIIRS SNPP/NOAA-20/NOAA-21) and save it to:
```text
data/raw/firms_raw.csv
```

### 3. Run the Data Pipeline
```bash
python run_pipeline.py --input data/raw/firms_raw.csv --output data/processed/firms_cleaned.csv
```

### 4. Run Unit Tests
```bash
python -m unittest discover tests
```

### 5. Launch Interactive EDA Notebook
```bash
jupyter notebook notebooks/01_firms_eda.ipynb
```

---

## 🛡️ Data Quality & Guardrails
- **No Data Fabrication**: Missing values are not filled with artificial numbers; corrupted records are logged and discarded.
- **No Fake Labels**: No synthetic industrial/wildfire labels are generated during raw preprocessing.
- **MODIS & VIIRS Compatibility**: Handles both numerical confidence (MODIS: 0-100) and categorical confidence (VIIRS: low/nominal/high).
