import asyncio
from services.chat_service import ChatService
from services.gemini_service import GeminiService
from services.analysis_service import AnalysisService
from services.prediction_service import PredictionService

class MockDB:
    class Sessions:
        async def find_one(self, query):
            return {"messages": [{"role": "user", "content": "I want to be rich."}]}
        async def update_one(self, *args, **kwargs):
            return None
    def __init__(self):
        self.sessions = self.Sessions()

async def test_full_chat():
    gemini = GeminiService()
    analysis = AnalysisService(db=MockDB())
    predict = PredictionService()
    chat = ChatService(gemini, analysis, predict, MockDB())
    
    print("Testing process_message...")
    res = await chat.process_message("How can I do this?", session_id="test1234")
    print(res)

if __name__ == "__main__":
    asyncio.run(test_full_chat())
