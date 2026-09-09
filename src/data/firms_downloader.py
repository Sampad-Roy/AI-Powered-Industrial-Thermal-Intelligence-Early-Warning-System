"""NASA FIRMS API Downloader Module (Optional Ingestion Utility).

Allows downloading real-time / NRT active fire data directly from NASA's official FIRMS API
using a user-provided NASA FIRMS MAP_KEY.

Documentation: https://firms.modaps.eosdis.nasa.gov/api/
"""

import os
import logging
from pathlib import Path
from typing import Optional, Union
import urllib.request
import urllib.error

logger = logging.getLogger(__name__)


def download_firms_nrt_data(
    map_key: str,
    source: str = "VIIRS_SNPP_NRT",
    country_code: str = "IND",
    day_range: int = 1,
    output_path: Union[str, Path] = "data/raw/firms_raw.csv"
) -> Path:
    """Downloads official active fire hotspot CSV data from the NASA FIRMS API.

    Args:
        map_key: 32-character NASA FIRMS MAP_KEY (obtain from https://firms.modaps.eosdis.nasa.gov/api/map_key/).
        source: Satellite sensor dataset identifier:
                - 'VIIRS_SNPP_NRT'
                - 'VIIRS_NOAA20_NRT'
                - 'VIIRS_NOAA21_NRT'
                - 'MODIS_NRT'
        country_code: ISO 3166-1 alpha-3 country code (e.g. 'IND' for India, 'USA', 'WORLD').
        day_range: Number of days of data to retrieve (1 to 10).
        output_path: Target path to save the downloaded CSV.

    Returns:
        Path: Path to the saved CSV file.

    Raises:
        ValueError: If map_key is invalid or empty.
        urllib.error.URLError: If network request fails.
    """
    if not map_key or len(map_key.strip()) == 0:
        raise ValueError("A valid NASA FIRMS MAP_KEY is required to fetch live data from NASA FIRMS API.")

    out_file = Path(output_path)
    out_file.parent.mkdir(parents=True, exist_ok=True)

    # NASA FIRMS Country API endpoint
    api_url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/{map_key.strip()}/{source}/{country_code}/{day_range}"
    logger.info(f"Fetching NASA FIRMS data for {country_code} ({source}, {day_range} day(s))...")

    try:
        req = urllib.request.Request(
            api_url,
            headers={"User-Agent": "SIH-2026-Industrial-Fire-Detection/1.0"}
        )
        with urllib.request.urlopen(req) as response, open(out_file, "wb") as out:
            data = response.read()
            # Check for API error response disguised as text
            if b"Invalid MAP_KEY" in data or b"Error:" in data:
                error_msg = data.decode("utf-8", errors="replace")
                logger.error(f"NASA FIRMS API Error: {error_msg}")
                raise ValueError(f"NASA FIRMS API Error: {error_msg}")
            out.write(data)

        logger.info(f"NASA FIRMS dataset successfully downloaded and saved to: {out_file}")
        return out_file

    except urllib.error.HTTPError as e:
        logger.error(f"HTTP Error {e.code} while connecting to NASA FIRMS API: {e.reason}")
        raise
    except urllib.error.URLError as e:
        logger.error(f"Network error while connecting to NASA FIRMS API: {e.reason}")
        raise
