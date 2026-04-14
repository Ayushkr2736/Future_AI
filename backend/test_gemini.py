import asyncio
import os
from services.gemini_service import GeminiService

async def test_gemini():
    service = GeminiService()
    text = "I'm really excited about this internship! I've been working hard and feel ready to contribute."
    
    print(f"Testing Gemini analysis for text: '{text}'")
    scores = await service.analyze_traits(text)
    print("Scores:")
    for trait, score in scores.items():
        print(f"  {trait}: {score}")
        
    print("\nTesting Gemini chat:")
    reply = await service.generate_reply("Hi! How's it going?")
    print(f"Reply: {reply}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
