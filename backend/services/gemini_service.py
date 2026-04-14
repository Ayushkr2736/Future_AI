import os
import json
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    # No hardcoded fallback for security. Ensure key is in .env.
    raise ValueError("GEMINI_API_KEY not found in environment variables.")
genai.configure(api_key=api_key)

async def analyze_user_input(text: str) -> Dict[str, float]:
    """
    Analyze psychological traits from text using Google Gemini.
    Returns a dictionary with confidence, motivation, clarity, and emotional_stability scores (0-1).
    """
    if not text or len(text.strip()) == 0:
        return {
            "confidence": 0.5,
            "motivation": 0.5,
            "clarity": 0.5,
            "emotional_stability": 0.5
        }

    # Use the model configuration for deterministic and strict JSON output
    model = genai.GenerativeModel(
        model_name='models/gemini-2.0-flash', # Using Gemini 2.0 Flash
        generation_config={
            "response_mime_type": "application/json",
            "temperature": 0.1, # Keep it deterministic
        }
    )

    prompt = (
        "Analyze the following text for psychological traits. "
        "Strictly return a JSON object with four keys: 'confidence', 'motivation', 'clarity', and 'emotional_stability'. "
        "Each value must be a float between 0 and 1 representing the trait score. "
        "No additional text, markdown, or explanation. "
        f"\n\nText to analyze: {text}"
    )

    try:
        response = await model.generate_content_async(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=512, # Enough for 4 floats
            )
        )
        if not response or not hasattr(response, "text"):
             raise ValueError("Empty or invalid response from Gemini API")

        content = response.text.strip()
        
        # Ensure we have valid JSON
        result = json.loads(content)
        
        # Final validation of fields and values
        final_scores = {
            "confidence": float(result.get("confidence", 0.5)),
            "motivation": float(result.get("motivation", 0.5)),
            "clarity": float(result.get("clarity", 0.5)),
            "emotional_stability": float(result.get("emotional_stability", 0.5))
        }
        
        # Clamp values to 0-1 range
        for key in final_scores:
            final_scores[key] = max(0.0, min(1.0, final_scores[key]))
            
        return final_scores
        
    except Exception as e:
        print(f"Gemini API analysis failed ({type(e).__name__}): {e}")
        # Return neutral fallback scores on failure
        return {
            "confidence": 0.5,
            "motivation": 0.5,
            "clarity": 0.5,
            "emotional_stability": 0.5
        }

class GeminiService:
    """Service to interact with Google Gemini for text analysis and chat."""

    def __init__(self):
        # Configuration is handled at module level but we can define the model for chat
        self.model = genai.GenerativeModel(
            model_name='models/gemini-2.0-flash',
            system_instruction=(
                "You are an intelligent psychological evaluation assistant named 'The Oracle'.\n\n"

                "Your job is NOT to immediately answer the user's question or give advice upfront.\n\n"

                "Instead, strictly follow this 5-step process:\n\n"

                "STEP 1 — UNDERSTAND: Carefully read and understand the user's goal, question, or intention.\n\n"

                "STEP 2 — QUESTION: Ask exactly 3 to 4 short, clear, conversational psychological or behavioral questions "
                "to better understand the following dimensions:\n"
                "  - Motivation: Why do they want this?\n"
                "  - Discipline level: How consistent are they?\n"
                "  - Past consistency: Have they done this before?\n"
                "  - Skills or preparation: Are they ready?\n"
                "  - Emotional readiness: How do they handle failure or frustration?\n"
                "Present all questions together in a numbered list. Keep each question to ONE line. "
                "Do NOT give any prediction, advice, or evaluation at this stage.\n\n"

                "STEP 3 — WAIT: After asking questions, wait for the user to respond to all of them. "
                "If the user has not yet answered your questions, gently remind them to answer first.\n\n"

                "STEP 4 — ANALYZE & PREDICT: Once the user provides their answers, analyze them deeply and deliver a prediction that includes:\n"
                "  - A clear verdict: whether the user is LIKELY TO SUCCEED or LIKELY TO STRUGGLE (based on their answers)\n"
                "  - Honest, specific reasoning tied directly to their answers (not generic)\n"
                "  - Tone: honest and supportive — not overly positive, not harsh\n"
                "  - If LIVE PSYCHOLOGICAL DATA is available (scores, success probability), incorporate it into your evaluation.\n\n"

                "STEP 5 — ACTIONABLE SUGGESTIONS: After the prediction, provide 3 to 5 specific, non-generic improvement suggestions "
                "that directly address the weak areas revealed in their answers.\n\n"

                "CRITICAL RULES:\n"
                "  - NEVER give a prediction before asking questions\n"
                "  - NEVER skip the questioning phase\n"
                "  - NEVER give generic motivational fluff (e.g., 'You can do it!')\n"
                "  - Keep questions conversational, not robotic\n"
                "  - Be realistic, specific, and respectful\n"
                "  - Always complete your thought — never end mid-sentence\n\n"

                "EXAMPLE FLOW:\n"
                "User: Can I become a backend developer in 6 months?\n"
                "Oracle:\n"
                "  1. How many hours per day can you consistently dedicate to learning?\n"
                "  2. Have you completed any programming projects before, even small ones?\n"
                "  3. How do you usually handle difficult problems or moments of frustration?\n"
                "  4. Are you currently following any structured roadmap or course?\n"
                "(Wait for answers, then evaluate based on responses)"
            )
        )

    async def generate_reply(
        self, 
        message: str, 
        scores: Dict[str, float] | None = None,
        prediction: Dict[str, Any] | None = None,
        history: list | None = None
    ) -> str:
        """Generate a response to a user message for a chat-like interaction."""
        context = ""
        
        if history and len(history) > 0:
            context += "[CONVERSATION HISTORY]\n"
            for msg in history:
                role = "User" if msg.get("role") == "user" else "Oracle"
                context += f"{role}: {msg.get('content')}\n"
            context += "\n"

        if scores and prediction:
            context += (
                f"[LIVE PSYCHOLOGICAL DATA — use this to inform your evaluation]\n"
                f"Trait Scores: {json.dumps(scores)}\n"
                f"Success Probability: {prediction.get('success_probability', 'Unknown')}%\n"
                f"Risk Level: {prediction.get('risk', 'Unknown')}\n\n"
            )

        try:
            turn_count = len(history) // 2 if history else 0
            if turn_count == 0:
                phase = "STEP 1+2: Understand the user's goal and ask your 3-4 psychological questions."
            elif turn_count < 3:
                phase = "STEP 3: The user may not have fully answered yet. Remind them kindly to respond to your questions if they haven't."
            elif turn_count < 5:
                phase = "STEP 4+5: The user has answered. Now analyze deeply, deliver your honest prediction, and provide actionable suggestions."
            else:
                phase = "CONTINUATION: Continue supporting the user based on the full context of the conversation."

            prompt_header = f"[TURN COUNT: {turn_count}]\n[CURRENT PHASE: {phase}]\n"
            
            response = await self.model.generate_content_async(
                f"{prompt_header}\n{context}\nUser: {message}\nOracle's Response:",
                generation_config=genai.types.GenerationConfig(
                    temperature=0.65,
                    max_output_tokens=2048,
                )
            )
            
            # Defensive check for truncation
            if response.candidates[0].finish_reason == 2: # 2 is MAX_TOKENS
                 print("WARNING: Gemini response truncated due to MAX_TOKENS.")
                 
            return response.text
        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Error generating gemini reply:\n{error_details}")
            with open("gemini_error.log", "w") as f:
                f.write(error_details)
            if "403" in str(e) and "leaked" in str(e).lower():
                return "(System Message: Your Gemini API Key has been reported as leaked. Please update the GEMINI_API_KEY in your .env file with a fresh key from Google AI Studio.)"
            return "The Oracle's vision is temporarily clouded (API Error). However, the data flow continues. Please speak again."

    async def analyze_traits(self, text: str) -> Dict[str, float]:
        """Wrapper for the core analyze_user_input function."""
        # The core function returns 0-1 as specifically requested by the user requirements.
        # However, the existing application (UI and PredictionService) expects 0-100.
        # We scale the scores here to maintain compatibility while preserving the core function's signature.
        raw_scores = await analyze_user_input(text)
        
        scaled_scores = {
            key: round(val * 100, 1) for key, val in raw_scores.items()
        }
        return scaled_scores

    async def generate_report(
        self,
        transcript: str,
        scores: Dict[str, float],
        prediction: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a structured analyst report based on candidate data."""
        
        report_prompt = (
            f"You are a professional HR analyst. Generate a comprehensive psychological report for a candidate interview.\n\n"
            f"CANDIDATE TRANSCRIPT: {transcript}\n\n"
            f"QUANTITATIVE SCORES: {json.dumps(scores)}\n\n"
            f"SUCCESS PREDICTION: {json.dumps(prediction)}\n\n"
            f"REQUIRED JSON FORMAT:\n"
            f"{{\n"
            f"  \"summary\": \"3-4 sentences summarizing psychological profile\",\n"
            f"  \"strengths\": [\"List of 3 key strengths\"],\n"
            f"  \"weaknesses\": [\"List of 3 potential growth areas\"],\n"
            f"  \"success_prediction\": \"Detailed success rationale\",\n"
            f"  \"action_plan\": [\"List of 3 actionable development steps\"]\n"
            f"}}"
        )

        try:
            # Reusing the flash model for reporting
            report_model = genai.GenerativeModel(model_name='models/gemini-2.0-flash')
            response = await report_model.generate_content_async(
                report_prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                    max_output_tokens=2048, # Increased limit for long reports
                    temperature=0.4,
                )
            )
            if not response or not hasattr(response, "text"):
                raise ValueError("Incomplete generation or safety block")
                
            return json.loads(response.text.strip())
        except Exception as e:
            print(f"Error generating analyst report ({type(e).__name__}): {e}")
            return {
                "summary": f"Full report generation failed partially due to: {str(e)}",
                "strengths": ["Analysis connection issue"],
                "weaknesses": ["Data processing timeout"],
                "success_prediction": "Unavailable due to generation error.",
                "action_plan": ["Please refresh and try again later."]
            }
