import motor.motor_asyncio
from beanie import init_beanie
from fastapi import Depends
from pymongo import MongoClient

from app.core.config import settings
from app.db.models import User, Contact, SMSMessage

# Connexion asynchrone pour FastAPI
# Base de données en mémoire pour le développement
from mongomock_motor import AsyncMongoMockClient

# Variable globale pour conserver l'instance de la base de données en mémoire entre les appels
_mock_db_instance = None

async def get_db():
    # Désérialiser les paramètres de connexion pour le debug
    print(f"Tentative de connexion à la base de données: {settings.MONGODB_DB_NAME}")
    # Ne pas afficher l'URL complète pour des raisons de sécurité
    mongo_url_masked = settings.MONGODB_URL.split('@')[-1] if '@' in settings.MONGODB_URL else 'non défini'
    print(f"URL MongoDB: ...@{mongo_url_masked}")
    
    try:
        # Connexion au client MongoDB avec timeout ajusté
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=10000,  # 10 secondes max
            connectTimeoutMS=10000,  # Timeout de connexion
            socketTimeoutMS=10000  # Timeout de socket
        )
        
        # Vérification que la connexion fonctionne
        await client.admin.command('ping')
        print("Connexion à MongoDB réussie !")
        
        # Afficher les bases de données disponibles
        db_list = await client.list_database_names()
        print(f"Bases de données disponibles: {db_list}")
        
        # Vérifier si la base cible existe
        target_db = settings.MONGODB_DB_NAME
        if target_db not in db_list:
            print(f"ATTENTION: La base de données '{target_db}' n'existe pas. Les collections seront créées automatiquement.")
        
        # Initialisation de Beanie avec les modèles de documents
        db = client[target_db]
        print(f"Collections disponibles: {await db.list_collection_names()}")
        
        await init_beanie(
            database=db,
            document_models=[
                User,
                Contact,
                SMSMessage
            ]
        )
        
        # Vérifier si des utilisateurs existent
        user_count = await User.count()
        print(f"Nombre d'utilisateurs dans la base: {user_count}")
        
        return db
        
    except Exception as e:
        # Arrêter l'application en cas d'erreur de connexion
        # pour éviter de tomber silencieusement sur la base en mémoire
        print(f"ERREUR CRITIQUE de connexion à MongoDB: {e}")
        raise e  # Ré-émettre l'exception pour arrêter l'application

# Pour les opérations sync (si nécessaire)
def get_sync_db():
    client = MongoClient(settings.MONGODB_URL)
    return client[settings.MONGODB_DB_NAME]
