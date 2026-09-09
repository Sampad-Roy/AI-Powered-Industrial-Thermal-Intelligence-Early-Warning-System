"""NASA FIRMS Data Loader Module.

Responsible for discovering, loading, and performing initial schema normalization
on raw NASA FIRMS CSV data (supports MODIS, VIIRS SNPP, NOAA-20, NOAA-21).
"""

import logging
from pathlib import Path
from typing import Union, Optional
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - [%(levelname)s] - %(message)s")
logger = logging.getLogger(__name__)


def load_firms_data(
    file_path: Union[str, Path],
    low_memory: bool = False
) -> pd.DataFrame:
    """Loads NASA FIRMS CSV dataset into a Pandas DataFrame.

    Args:
        file_path: Path to the raw FIRMS CSV file.
        low_memory: Parameter passed to pd.read_csv to handle large files.

    Returns:
        pd.DataFrame: Loaded DataFrame with normalized column headers (lowercase).

    Raises:
        FileNotFoundError: If the specified file does not exist.
        ValueError: If the file is empty or cannot be parsed as a CSV.
    """
    path = Path(file_path)
    if not path.exists():
        logger.error(f"FIRMS data file not found at: {path}")
        raise FileNotFoundError(f"FIRMS data file not found at: {path}")

    if path.stat().st_size == 0:
        logger.error(f"FIRMS data file is empty: {path}")
        raise ValueError(f"FIRMS data file is empty: {path}")

    logger.info(f"Loading NASA FIRMS data from: {path}")
    try:
        df = pd.read_csv(path, low_memory=low_memory)
    except Exception as e:
        logger.error(f"Failed to read CSV file at {path}: {e}")
        raise ValueError(f"Failed to read CSV file: {e}") from e

    # Normalize column names: strip whitespace and convert to lowercase
    df.columns = df.columns.str.strip().str.lower()
    logger.info(f"Successfully loaded {len(df):,} records with columns: {list(df.columns)}")

    return df
