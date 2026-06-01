import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# App configurations
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")

# Max text length to pass to Gemini (approx 4000 words / ~5000 tokens to prevent rate limits and maintain high quality summary/cards)
MAX_CONTENT_CHARS = int(os.getenv("MAX_CONTENT_CHARS", 25000))
