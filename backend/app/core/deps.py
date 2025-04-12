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
