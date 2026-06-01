import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import MAX_CONTENT_CHARS
from app.services.parser import extract_text_from_file
from app.services.scraper import scrape_url_text
from app.services.gemini import generate_study_material

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bilim-backend")

app = FastAPI(title="Bilim API", description="AI-powered educational study aids generation server")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev server and PWA hosts
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str

@app.get("/api/health")
async def health_check():
    """Verify backend and API status."""
    return {"status": "ok"}

@app.post("/api/scrape")
async def scrape_endpoint(request: ScrapeRequest):
    """Scrape and extract clean text content from a URL."""
    try:
        logger.info(f"Scrape request received for URL: {request.url}")
        content = await scrape_url_text(request.url)
        return {"text": content}
    except Exception as e:
        logger.error(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Web scraping failed: {str(e)}")

@app.post("/api/ingest")
async def ingest_endpoint(
    title: str = Form(...),
    text: str = Form(None),
    file: UploadFile = File(None)
):
    """Extract content from file or text, call Gemini to generate flashcards, concepts, and quizzes."""
    try:
        content_text = ""
        
        # 1. Extract content from either uploaded file or text input
        if file:
            logger.info(f"Ingest request received for file: {file.filename}")
            file_bytes = await file.read()
            content_text = extract_text_from_file(file_bytes, file.filename)
        elif text:
            logger.info("Ingest request received for text input")
            content_text = text
        else:
            raise HTTPException(status_code=400, detail="Please upload a PDF/DOCX/TXT file or paste text content.")
            
        content_text = content_text.strip()
        if not content_text:
            raise HTTPException(status_code=400, detail="The provided content is empty.")
            
        # 2. Smart Truncation
        # If the content is extremely long, truncate it to stay within cost-effective limits
        # and maintain premium quality AI summarization without context dilation.
        is_truncated = False
        if len(content_text) > MAX_CONTENT_CHARS:
            logger.info(f"Content length ({len(content_text)} chars) exceeds limit ({MAX_CONTENT_CHARS}). Truncating.")
            content_text = content_text[:MAX_CONTENT_CHARS] + "\n\n[Content truncated for study focus by Bilim AI]"
            is_truncated = True
            
        # 3. Call Gemini to generate the study material
        logger.info("Calling Gemini API...")
        study_material = generate_study_material(title, content_text)
        
        # 4. Attach truncation flag to response
        study_material["isTruncated"] = is_truncated
        
        logger.info("Ingestion completed successfully.")
        return study_material
        
    except ValueError as ve:
        logger.warning(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Server error during ingestion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
