import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
import time

INPUT_CSV = "appic.csv"
OUTPUT_CSV = "appic_with_web_data.csv"
URL_COLUMN = "URL"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; ResearchBot/1.0)"
}

def scrape_text(url, timeout=15):
    try:
        response = requests.get(url, headers=HEADERS, timeout=timeout)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "lxml")

        # Remove non-content elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)

        # Collapse excessive whitespace
        text = " ".join(text.split())

        return text

    except Exception as e:
        return f"[ERROR] {str(e)}"


def main():
    df = pd.read_csv(INPUT_CSV)

    if URL_COLUMN not in df.columns:
        raise ValueError(f"Column '{URL_COLUMN}' not found in CSV.")

    web_data = []

    for url in tqdm(df[URL_COLUMN], desc="Scraping URLs"):
        if pd.isna(url) or not str(url).startswith("http"):
            web_data.append("")
            continue

        text = scrape_text(url)
        web_data.append(text)

        # Be polite to servers
        time.sleep(1)

    df["web_data"] = web_data
    df.to_csv(OUTPUT_CSV, index=False)

    print(f"✅ Done! Saved to {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
