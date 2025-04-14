from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api import schemas
from app.core import security
from app.core.config import settings
from app.db import models
from app.db.database import get_db

router = APIRouter()


@router.post(
    "/login/access-token",
    response_model=schemas.Token,
    summary="Obtenir un token d'authentification",
    description="""
    Authentifie un utilisateur et retourne un token JWT valide pour les requêtes futures.
    Ce token doit être inclus dans l'en-tête Authorization des requêtes suivantes.
    
    **Requête**:
    - email: Email de l'utilisateur
    - password: Mot de passe de l'utilisateur
    
    **Réponse**:
    - access_token: Token JWT
    - token_type: Type du token (bearer)
    
    **Code d'erreur**:
    - 401: Email ou mot de passe incorrect
    - 400: Utilisateur inactif
    """
)
async def login_access_token(
    db: AsyncIOMotorDatabase = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, récupère un token d'accès pour les futures requêtes
    """
    # Recherche de l'utilisateur par email
    user = await models.User.find_one({"email": form_data.username})
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            str(user.id), expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post(
    "/signup",
    response_model=schemas.User,
    summary="Créer un nouveau compte utilisateur",
    description="""
    Crée un nouveau compte utilisateur avec les informations fournies.
    
    **Requête**:
    - email: Email de l'utilisateur (doit être unique)
    - password: Mot de passe de l'utilisateur
    
    **Réponse**:
    - id: Identifiant unique de l'utilisateur
    - email: Email de l'utilisateur
    - is_active: Statut d'activation du compte
    
    **Code d'erreur**:
    - 400: Email déjà utilisé
    """
)
async def create_user(
    *,
    db: AsyncIOMotorDatabase = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Crée un nouvel utilisateur
    """
    # Vérifier si l'utilisateur existe déjà
    existing_user = await models.User.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cet email est déjà utilisé"
        )
    
    # Créer le nouvel utilisateur
    hashed_password = security.get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        is_active=True,
        is_superuser=False,
    )
    
    # Sauvegarder l'utilisateur dans MongoDB
    await db_user.save()
    
    return db_user
