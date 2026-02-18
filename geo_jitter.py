import pandas as pd
import numpy as np
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from tqdm import tqdm

INPUT_CSV = "appic_with_web_data.csv"
OUTPUT_CSV = "appic_with_web_and_geo.csv"
LOCATION_COLUMN = "Location"

# Initialize geocoder
geolocator = Nominatim(user_agent="appic_geocoder")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

# Jitter settings (~200–300 meters)
JITTER_STD = 0.002

def normalize_location(loc):
    return ", ".join(part.strip() for part in loc.split(","))

def jitter(value, std=JITTER_STD):
    return value + np.random.normal(0, std)

def main():
    df = pd.read_csv(INPUT_CSV)

    # Normalize locations
    df["_location_norm"] = df[LOCATION_COLUMN].astype(str).apply(normalize_location)

    # Count duplicates
    location_counts = df["_location_norm"].value_counts()

    df["lat"] = np.nan
    df["long"] = np.nan

    location_cache = {}

    for i, loc in tqdm(df["_location_norm"].items(), desc="Geocoding"):
        if not isinstance(loc, str) or loc.lower() == "nan":
            continue

        if loc not in location_cache:
            geo = geocode(loc)
            if geo:
                location_cache[loc] = (geo.latitude, geo.longitude)
            else:
                location_cache[loc] = (np.nan, np.nan)

        lat, lon = location_cache[loc]
        df.at[i, "lat"] = lat
        df.at[i, "long"] = lon

    # Apply jitter ONLY to duplicated locations
    df["lat_jittered"] = df.apply(
        lambda row: jitter(row["lat"]) if location_counts[row["_location_norm"]] > 1 else row["lat"],
        axis=1
    )

    df["long_jittered"] = df.apply(
        lambda row: jitter(row["long"]) if location_counts[row["_location_norm"]] > 1 else row["long"],
        axis=1
    )

    # Cleanup
    df.drop(columns=["_location_norm"], inplace=True)

    df.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ Saved to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
