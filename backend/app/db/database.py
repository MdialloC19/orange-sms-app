import motor.motor_asyncio
from beanie import init_beanie
from fastapi import Depends
from pymongo import MongoClient

from app.core.config import settings
from app.db.models import User, Contact, SMSMessage

# Connexion asynchrone pour FastAPI
async def get_db():
    # Connexion au client MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
    # Initialisation de Beanie avec les modèles de documents
    await init_beanie(
        database=client[settings.MONGODB_DB_NAME],
        document_models=[
            User,
            Contact,
            SMSMessage
        ]
    )
    return client[settings.MONGODB_DB_NAME]

# Pour les opérations sync (si nécessaire)
def get_sync_db():
    client = MongoClient(settings.MONGODB_URL)
    return client[settings.MONGODB_DB_NAME]
