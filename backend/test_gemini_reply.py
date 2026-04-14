import asyncio
from services.gemini_service import GeminiService
from dotenv import load_dotenv

async def test():
    load_dotenv()
    import google.generativeai as genai
    import os
    genai.configure(api_key=os.getenv("GEMINI_API_KEY") or "AIzaSyC217vfBS1tFIiyiubUasR5pv_83sFbijs")
    
    gemini = GeminiService()
    scores = {"confidence": 80.0, "motivation": 75.0, "clarity": 90.0, "emotional_stability": 85.0}
    prediction = {"success_probability": 82.5, "risk": "Low"}
    
    history = [
        {"role": "user", "content": "I want to start a new business"},
        {"role": "assistant", "content": "Interesting... What is the deep motivation behind this? Money or passion?"}
    ]
    
    print("Testing generate_reply with psychologist persona...")
    try:
        reply = await gemini.generate_reply("Money, to be honest. I want to be rich.", scores, prediction, history)
        print("Reply:", reply)
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Exception caught in script:", e)

if __name__ == "__main__":
    asyncio.run(test())
