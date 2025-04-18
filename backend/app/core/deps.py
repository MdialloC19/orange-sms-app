from typing import Optional

from beanie import PydanticObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

from app.api import schemas
from app.core import security
from app.core.config import settings
from app.db import models
from app.db.database import get_db

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)


async def get_current_user(
    db: AsyncIOMotorDatabase = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    """
    Valide le JWT token et retourne l'utilisateur courant
    """
    # Mode de développement - permettre d'accéder sans token valide
    dev_mode = True  # Désactiver en production
    
    if dev_mode:
        # Vérifier si un utilisateur de test existe déjà
        test_user = await models.User.find_one({"email": "user@example.com"})
        if test_user:
            return test_user
            
        # Créer un utilisateur de test si nécessaire
        from app.core.security import get_password_hash
        new_test_user = models.User(
            email="user@example.com",
            hashed_password=get_password_hash("password"),
            full_name="Utilisateur Test",
            is_active=True
        )
        await new_test_user.save()
        return new_test_user
    
    # Mode normal (production) - validation complète du token
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Impossible de valider les identifiants",
        )
    
    user_id = token_data.sub
    user = await models.User.get(PydanticObjectId(user_id))
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Utilisateur non trouvé"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Utilisateur inactif"
        )
    
    return user


async def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """
    Vérifie si l'utilisateur courant est un superutilisateur
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="L'utilisateur n'a pas les privilèges suffisants",
        )
    return current_user
