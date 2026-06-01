import os
import json
from typing import List, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from app.config import GEMINI_API_KEY

# Define Schemas for Gemini Structured JSON Outputs
class ConceptSchema(BaseModel):
    id: str = Field(description="Unique identifier starting with 'c_1', 'c_2', etc.")
    term: str = Field(description="The scientific or conceptual term name.")
    definition: str = Field(description="A clear, pedagogical definition.")
    formula: Optional[str] = Field(None, description="Latex formula string (e.g. 'E = mc^2'), or null.")
    hasFormula: bool = Field(description="True if a math/science equation is present in this concept.")

class FlashcardSchema(BaseModel):
    id: str = Field(description="Unique card identifier starting with 'fc_1', 'fc_2', etc.")
    front: str = Field(description="Focused active recall question, prompt, or fill-in-the-blank.")
    back: str = Field(description="Clear, comprehensive answer explanation. Use LaTeX for math equations.")
    concept_id: str = Field(description="The matching concept ID from the concepts array this card helps review.")

class QuizQuestionSchema(BaseModel):
    id: str = Field(description="Unique question identifier starting with 'q_1', 'q_2', etc.")
    question: str = Field(description="Conceptual understanding or application question.")
    options: List[str] = Field(description="List of exactly 4 distinct answer choices.")
    correct: int = Field(description="Index of the correct answer (0 to 3).")
    explanation: str = Field(description="Detailed tutoring explanation of the correct choice and why distractors are wrong.")

class StudyMaterialSchema(BaseModel):
    title: str = Field(description="A clean, engaging title for this study material.")
    summary: str = Field(description="A rich, encouraging, conceptual AI summary (1-3 sentences) written in a motivating tone.")
    concepts: List[ConceptSchema] = Field(description="Main conceptual nodes extracted from the text.")
    flashcards: List[FlashcardSchema] = Field(description="Spaced repetition active recall cards.")
    quiz: List[QuizQuestionSchema] = Field(description="Exactly 5 multiple-choice questions for checking mastery.")


SYSTEM_PROMPT = """
You are Bilim AI, a world-class cognitive science tutor specializing in active recall and spaced repetition. Your goal is to break down the provided educational content into a structured, highly engaging study dataset.

Pedagogical Core Rules:
1. English Only: Generate all output in English.
2. Conceptual Hierarchy: Extract the essential ideas. Each concept should have a short term (what it is) and a clear, conceptual definition. If the concept involves a math/science formula, provide it in LaTeX (e.g. use $...$ for inline equations or $$...$$ for display equations) and set `hasFormula` to true.
3. Engaging Flashcards (Active Recall):
   - Make cards hyper-focused. A card should test a single mental node, not a paragraph of text.
   - Use variety: instead of simple "What is X?", use scenario-based questions ("If condition X happens, what occurs to Y?"), mechanisms ("How does process X trigger result Y?"), or fill-in-the-blanks.
   - The back of the cards must be concise and satisfying, explaining the concept with rich details (and math formulas in LaTeX where appropriate).
4. Comprehension Quizzes:
   - Provide exactly 5 multiple choice questions.
   - Each question must have exactly 4 options.
   - Ensure the correct option index is designated accurately (0 to 3).
   - Formulate questions to test conceptual understanding, critical analysis, or application—avoid simple trivia.
   - The "explanation" must be a mini-lesson: state why the correct option is true and briefly clarify why the main distractors are incorrect. Make it satisfying to read.
5. Tone: Energetic, intellectually stimulating, clear, and encouraging. Focus on the joy of discovery and making learning feel effortless and game-like.
"""

def generate_study_material(title: str, text_content: str) -> dict:
    """Send text to Gemini 3.0/2.5 Flash and return structured study material."""
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in the environment (.env file).")
        
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"Title of Material: {title}\n\nContent:\n{text_content}"
    
    # We use gemini-2.5-flash as the latest standard Flash model in the google-genai SDK
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=StudyMaterialSchema,
            system_instruction=SYSTEM_PROMPT,
            temperature=0.2,
        )
    )
    
    if not response.text:
        raise RuntimeError("Failed to receive a valid response from Gemini API.")
        
    # Load string into python dict to validate structure
    result = json.loads(response.text)
    return result
