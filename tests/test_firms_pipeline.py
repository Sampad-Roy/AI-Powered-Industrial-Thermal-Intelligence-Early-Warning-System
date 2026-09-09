"""Unit and Integration Tests for NASA FIRMS Data Pipeline."""

import unittest
import tempfile
from pathlib import Path
import pandas as pd
import numpy as np

from src.data.firms_loader import load_firms_data
from src.data.firms_validator import validate_firms_schema, validate_coordinates, validate_physical_values
from src.data.firms_cleaner import parse_firms_datetime, remove_duplicates, handle_missing_values, clean_firms_data
from src.data.firms_eda import generate_eda_summary, compute_distribution_stats
from src.data.pipeline import run_firms_pipeline


class TestFirmsPipeline(unittest.TestCase):

    def setUp(self):
        # Create a realistic test DataFrame reflecting NASA FIRMS (MODIS/VIIRS) schema
        self.sample_data = {
            "latitude": [28.6139, 19.0760, 95.0000, 13.0827, 28.6139, 22.5726, np.nan],  # 95 is invalid lat
            "longitude": [77.2090, 72.8777, 80.0000, 195.0000, 77.2090, 88.3639, 78.0000], # 195 is invalid lon
            "brightness": [325.4, 310.2, 340.0, 315.0, 325.4, -5.0, 305.0],               # -5 is invalid Kelvin
            "scan": [1.1, 1.0, 1.2, 1.0, 1.1, 1.3, 1.0],
            "track": [1.0, 1.0, 1.1, 1.0, 1.0, 1.1, 1.0],
            "acq_date": ["2026-03-01", "2026-03-01", "2026-03-02", "2026-03-02", "2026-03-01", "2026-03-03", "2026-03-03"],
            "acq_time": [430, 1345, 200, 600, 430, 1200, 800],                            # Row 0 and 4 are exact duplicates
            "satellite": ["Terra", "Aqua", "Terra", "Terra", "Terra", "Aqua", "Aqua"],
            "instrument": ["MODIS", "MODIS", "MODIS", "MODIS", "MODIS", "MODIS", "MODIS"],
            "confidence": [85, 90, 50, 75, 85, 60, 80],
            "version": ["6.1NRT", "6.1NRT", "6.1NRT", "6.1NRT", "6.1NRT", "6.1NRT", "6.1NRT"],
            "bright_t31": [295.2, 290.1, 300.0, 292.0, 295.2, 280.0, 290.0],
            "frp": [24.5, 12.8, 45.0, 18.2, 24.5, -2.0, 15.0],                            # -2 is invalid FRP
            "daynight": ["D", "D", "N", "D", "D", "D", "D"]
        }
        self.df_sample = pd.DataFrame(self.sample_data)

    def test_schema_validation(self):
        """Test required columns validation."""
        is_valid, missing = validate_firms_schema(self.df_sample)
        self.assertTrue(is_valid)
        self.assertEqual(len(missing), 0)

        # Drop required column
        df_invalid = self.df_sample.drop(columns=["latitude"])
        is_valid_inv, missing_inv = validate_firms_schema(df_invalid)
        self.assertFalse(is_valid_inv)
        self.assertIn("latitude", missing_inv)

    def test_coordinate_validation(self):
        """Test geographic coordinate bounds filtering (-90<=lat<=90, -180<=lon<=180)."""
        valid_df, stats = validate_coordinates(self.df_sample)
        # Invalid records: row index 2 (lat 95), row index 3 (lon 195), row index 6 (nan lat)
        self.assertEqual(stats["invalid_coordinate_records"], 3)
        self.assertEqual(len(valid_df), 4)
        self.assertTrue((valid_df["latitude"] >= -90.0).all() and (valid_df["latitude"] <= 90.0).all())
        self.assertTrue((valid_df["longitude"] >= -180.0).all() and (valid_df["longitude"] <= 180.0).all())

    def test_datetime_parsing(self):
        """Test converting acq_date and acq_time to unified UTC timestamp."""
        df_parsed = parse_firms_datetime(self.df_sample)
        self.assertIn("acq_datetime", df_parsed.columns)
        # Check first row (2026-03-01 04:30)
        expected_dt = pd.to_datetime("2026-03-01 04:30:00", utc=True)
        self.assertEqual(df_parsed["acq_datetime"].iloc[0], expected_dt)

    def test_duplicate_removal(self):
        """Test removal of exact duplicates."""
        clean_df, stats = remove_duplicates(self.df_sample)
        # Row 4 is duplicate of row 0
        self.assertEqual(stats["exact_duplicates_removed"], 1)
        self.assertEqual(len(clean_df), len(self.df_sample) - 1)

    def test_physical_validation(self):
        """Test detection and filtering of physically invalid measurements (brightness <= 0, FRP < 0)."""
        valid_df, stats = validate_physical_values(self.df_sample)
        # Row 5 has brightness -5 and frp -2
        self.assertIn("invalid_frp_count", stats)
        self.assertEqual(stats["invalid_frp_count"], 1)
        self.assertNotIn(5, valid_df.index)

    def test_eda_summary_generation(self):
        """Test statistical summary and distribution calculations."""
        summary = generate_eda_summary(self.df_sample)
        self.assertEqual(summary["total_records"], len(self.df_sample))
        self.assertIn("frp_distribution", summary)
        self.assertIn("brightness_distribution", summary)
        self.assertIn("confidence_distribution", summary)
        self.assertIn("geospatial_bounds", summary)

    def test_end_to_end_pipeline(self):
        """Test full pipeline execution with temp CSV file."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp_path = Path(tmpdir)
            raw_csv = tmp_path / "raw_firms.csv"
            processed_csv = tmp_path / "cleaned_firms.csv"
            report_json = tmp_path / "eda_report.json"

            self.df_sample.to_csv(raw_csv, index=False)

            results = run_firms_pipeline(
                raw_csv_path=raw_csv,
                processed_csv_path=processed_csv,
                eda_report_path=report_json,
                generate_report=True
            )

            self.assertTrue(processed_csv.exists())
            self.assertTrue(report_json.exists())
            self.assertGreater(len(results["df_cleaned"]), 0)


if __name__ == "__main__":
    unittest.main()
