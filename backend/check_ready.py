import os
import asyncio
import google.generativeai as genai
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def check_ready():
    print("🚀 Oracle AI Readiness Check\n" + "="*30)
    load_dotenv()
    
    # 1. Check API Key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ Error: GEMINI_API_KEY is missing from .env")
    else:
        print(f"✅ GEMINI_API_KEY found (starts with: {api_key[:6]}...)")
        
    # 2. Test Gemini API
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-1.5-flash')
        response = model.generate_content("Hello")
        if response.text:
            print("✅ Gemini API Connection: SUCCESS")
    except Exception as e:
        print(f"❌ Gemini API Connection: FAILED ({e})")
        
    # 3. Check MongoDB
    mongo_uri = os.getenv("MONGODB_URI")
    if not mongo_uri:
        print("❌ Error: MONGODB_URI is missing from .env")
    else:
        try:
            client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=5000)
            await client.admin.command('ping')
            print("✅ MongoDB Connection: SUCCESS")
            client.close()
        except Exception as e:
            print(f"❌ MongoDB Connection: FAILED ({e})")
            
    print("\n" + "="*30)
    print("Conclusion: Backend " + ("IS" if api_key and mongo_uri else "is NOT") + " configured correctly.")

if __name__ == "__main__":
    asyncio.run(check_ready())
