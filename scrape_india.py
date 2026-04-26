import requests
from bs4 import BeautifulSoup
import json
import os

def scrape():
    url = "https://en.wikipedia.org/wiki/List_of_constituencies_of_the_Lok_Sabha"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')

    tables = soup.find_all('table', {'class': 'wikitable'})
    
    # Looking for the summary table which has states and seat counts
    print(f"Found {len(tables)} tables")
    target_table = None
    for t in tables:
        headers_texts = [th.text.strip().lower() for th in t.find_all('th')]
        if any('state/union territory' in h or 'state' in h for h in headers_texts):
            target_table = t
            break
            
    if not target_table:
        print("Table not found")
        return

    states = []
    
    # We will try to parse rows. Usually cols are No., State, Total Constituencies etc
    rows = target_table.find_all('tr')
    for row in rows:
        cols = row.find_all(['td', 'th'])
        if len(cols) >= 2:
            name = cols[1].text.strip()
            # If the third column has the total constituencies (often true in this wiki article)
            if len(cols) >= 3:
                try:
                    count_text = cols[2].text.strip().split('[')[0] # remove citations
                    seats = int(count_text)
                    if name.lower() not in ('total', 'state/union territory'):
                        states.append({"name": name, "seats": seats})
                except ValueError:
                    pass

    output_path = os.path.join(os.path.dirname(__file__), 'data', 'india_states.json')
    with open(output_path, 'w') as f:
        json.dump({"states": states}, f, indent=2)

    print(f"Scraped {len(states)} states/UTs and saved to data/india_states.json")

if __name__ == "__main__":
    scrape()
