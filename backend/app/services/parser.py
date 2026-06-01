import io
from pypdf import PdfReader
from docx import Document

def parse_pdf(file_bytes: bytes) -> str:
    """Extract plain text from a PDF file in bytes."""
    text_content = []
    pdf_file = io.BytesIO(file_bytes)
    reader = PdfReader(pdf_file)
    
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_content.append(page_text)
            
    return "\n".join(text_content)

def parse_docx(file_bytes: bytes) -> str:
    """Extract plain text from a Word (.docx) document in bytes."""
    docx_file = io.BytesIO(file_bytes)
    doc = Document(docx_file)
    paragraphs = [p.text for p in doc.paragraphs if p.text]
    return "\n".join(paragraphs)

def parse_txt(file_bytes: bytes) -> str:
    """Decode raw bytes of a text file, falling back to iso-8859-1 if utf-8 fails."""
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("iso-8859-1")

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Determine file extension and parse content into plain text."""
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        return parse_pdf(file_bytes)
    elif ext in ["docx", "doc"]:
        return parse_docx(file_bytes)
    elif ext == "txt":
        return parse_txt(file_bytes)
    else:
        raise ValueError(f"Unsupported file format: .{ext}. Supported formats are PDF, DOCX, TXT.")
