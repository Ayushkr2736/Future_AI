import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/oracle_ai")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.get_database("oracle_ai")

def get_db():
    return db

async def close_db():
    client.close()
