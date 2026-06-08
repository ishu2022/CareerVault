# services/pdf_extractor.py
import pdfplumber
import fitz  # pymupdf fallback

def extract_text(pdf_path: str) -> dict:
    """Returns {'text': str, 'pages': int, 'method': str}"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            pages = []
            for page in pdf.pages:
                text = page.extract_text()
                if text and len(text.strip()) > 50:
                    pages.append(text)
            
            if pages:
                return {
                    "text": "\n\n--- PAGE BREAK ---\n\n".join(pages),
                    "pages": len(pdf.pages),
                    "method": "pdfplumber"
                }
    except Exception:
        pass
    
    # Fallback: pymupdf
    doc = fitz.open(pdf_path)
    text = " ".join([page.get_text() for page in doc])
    return {"text": text, "pages": len(doc), "method": "pymupdf"}