import httpx
from bs4 import BeautifulSoup

async def scrape_url_text(url: str) -> str:
    """Asynchronously fetch a web URL and scrape its clean main text."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Remove script, style, and navigation elements
    for element in soup(["script", "style", "nav", "header", "footer", "aside", "iframe", "noscript"]):
        element.decompose()
        
    # Get clean text
    lines = (line.strip() for line in soup.get_text().splitlines())
    # Break multi-headlines into a line each, remove leading/trailing space
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    text_content = "\n".join(chunk for chunk in chunks if chunk)
    
    if not text_content:
        raise ValueError("Could not extract any readable content from the provided URL.")
        
    return text_content
