from fastapi import APIRouter

from app.api.endpoints import auth, contacts, sms

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(sms.router, prefix="/sms", tags=["sms"])
api_router.include_router(contacts.router, prefix="/contacts", tags=["contacts"])
