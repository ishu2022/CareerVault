# services/ai_parser.py
import anthropic
import json

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env

EXTRACTION_PROMPT = """
You are an expert at extracting structured interview experience data.
Given the following interview experience text, extract information into JSON.

Return ONLY valid JSON, nothing else:
{
  "company": "string",
  "role": "string",
  "year": "string or null",
  "difficulty": "easy|medium|hard",
  "outcome": "selected|rejected|unknown",
  "rounds": [
    {
      "round_number": 1,
      "round_type": "coding|system_design|hr|managerial|technical",
      "questions": ["question text", ...],
      "tips": ["tip text", ...]
    }
  ],
  "overall_tips": ["tip text", ...],
  "technologies_mentioned": ["tech name", ...]
}

Interview text:
{text}
"""

def ai_extract(text: str) -> dict:
    # Truncate to avoid token limits on very long PDFs
    truncated = text[:6000]
    
    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{
            "role": "user",
            "content": EXTRACTION_PROMPT.format(text=truncated)
        }]
    )
    
    raw = message.content[0].text
    return json.loads(raw)