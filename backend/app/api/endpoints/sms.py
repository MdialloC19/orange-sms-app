from typing import Any, List
from beanie import PydanticObjectId

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api import schemas
from app.core import sms
from app.core.deps import get_current_user
from app.db import models
from app.db.database import get_db

router = APIRouter()


@router.post(
    "/send",
    response_model=schemas.SMS,
    summary="Envoyer un SMS via Orange",
    description="""
    Envoie un SMS via l'API Orange et enregistre l'historique.
    
    **Requête**:
    - recipient_number: Numéro de téléphone du destinataire (format international)
    - message: Contenu du message SMS
    - recipient_id: ID du contact dans la base de données (optionnel)
    
    **Réponse**:
    - id: Identifiant unique du SMS
    - sender_id: ID de l'utilisateur qui a envoyé le SMS
    - recipient_number: Numéro de téléphone du destinataire
    - message: Contenu du message
    - status: Statut actuel du SMS
    - created_at: Date d'envoi
    - updated_at: Dernière mise à jour
    
    **Code d'erreur**:
    - 500: Erreur lors de l'envoi du SMS
    """
)
async def send_sms(
    *,
    db: AsyncIOMotorDatabase = Depends(get_db),
    sms_in: schemas.SMSSend,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Envoie un SMS via l'API Orange et enregistre l'historique
    """
    try:
        result = await sms.send_sms(
            db=db,
            user_id=str(current_user.id),
            recipient_number=sms_in.recipient_number,
            message=sms_in.message,
            recipient_id=sms_in.recipient_id
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get(
    "/history",
    response_model=List[schemas.SMS],
    summary="Lister l'historique des SMS",
    description="""
    Récupère l'historique des SMS envoyés par l'utilisateur courant.
    
    **Paramètres**:
    - skip: Nombre d'éléments à sauter (pour la pagination)
    - limit: Nombre maximum d'éléments à retourner (par défaut: 100)
    
    **Réponse**:
    - Liste d'objets SMS avec leurs détails
    """
)
async def get_sms_history(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Récupère l'historique des SMS envoyés par l'utilisateur courant
    """
    sms_messages = await models.SMSMessage.find(
        {"sender_id": str(current_user.id)}
    ).sort("-created_at").skip(skip).limit(limit).to_list()
    return sms_messages


@router.get(
    "/{sms_id}",
    response_model=schemas.SMS,
    summary="Détails d'un SMS spécifique",
    description="""
    Récupère les détails complets d'un SMS spécifique.
    
    **Paramètres**:
    - sms_id: Identifiant unique du SMS
    
    **Réponse**:
    - Détails complets du SMS
    
    **Code d'erreur**:
    - 404: SMS non trouvé ou ID invalide
    """
)
async def get_sms(
    sms_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Récupère les détails d'un SMS spécifique
    """
    try:
        sms = await models.SMSMessage.get(PydanticObjectId(sms_id))
        if not sms or sms.sender_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS non trouvé"
            )
        return sms
    except (ValueError, HTTPException):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SMS non trouvé ou ID invalide"
        )


@router.get(
    "/{sms_id}/status",
    response_model=schemas.SMSDeliveryStatus,
    summary="Vérifier le statut d'un SMS",
    description="""
    Vérifie le statut de livraison d'un SMS envoyé.
    
    **Paramètres**:
    - sms_id: Identifiant unique du SMS
    
    **Réponse**:
    - status: Statut actuel du SMS
    - delivery_time: Heure de livraison (si disponible)
    - error: Message d'erreur (si applicable)
    
    **Code d'erreur**:
    - 404: SMS non trouvé ou ID invalide
    """
)
async def check_sms_status(
    sms_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Vérifie le statut de livraison d'un SMS auprès de l'API Orange
    """
    try:
        # D'abord vérifier si le SMS existe et appartient à l'utilisateur
        db_sms = await models.SMSMessage.get(PydanticObjectId(sms_id))
        if not db_sms or db_sms.sender_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS non trouvé"
            )
        
        if not db_sms.message_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ce SMS n'a pas d'identifiant de message (envoi initial échoué)"
            )
        
        status_result = await sms.check_sms_status(db, sms_id)
        return schemas.SMSDeliveryStatus(
            message_id=db_sms.message_id,
            status=status_result["status"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification du statut: {str(e)}"
        )
