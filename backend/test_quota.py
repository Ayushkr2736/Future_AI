import asyncio
import os
import google.generativeai as genai
from dotenv import load_dotenv

async def check_quotas():
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY") or "AIzaSyC217vfBS1tFIiyiubUasR5pv_83sFbijs")
    
    models_to_test = [
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
        "models/gemini-pro-latest",
        "models/gemini-flash-latest"
    ]
    
    try:
        with open("quota_output.txt", "w", encoding="utf-8") as f:
            f.write("Testing Quotas for models...\n")
            for m in models_to_test:
                model = genai.GenerativeModel(m)
                try:
                    res = await model.generate_content_async("Hi")
                    f.write(f"OK: {m}: SUCCESS\n")
                except Exception as e:
                    err_str = str(e).replace("\n", " ")
                    if "limit: 0" in err_str:
                        f.write(f"FAIL: {m}: LIMIT 0 (Blocked)\n")
                    elif "quota" in err_str.lower() or "429" in err_str:
                        f.write(f"FAIL_QUOTA: {m}: Rate Limited / Quota Exceeded\n")
                    else:
                        f.write(f"FAIL_OTHER: {m}: Error - {e}\n")
    except Exception:
        pass
                
if __name__ == "__main__":
    asyncio.run(check_quotas())
