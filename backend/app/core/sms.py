from typing import Dict, Optional
from beanie import PydanticObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.models import SMSMessage, Contact
from app.services.orange_api import orange_sms_service


async def send_sms(
    db: AsyncIOMotorDatabase, 
    user_id: str, 
    recipient_number: str, 
    message: str, 
    recipient_id: Optional[str] = None
) -> SMSMessage:
    """
    Envoie un SMS et enregistre les détails dans la base de données
    
    Args:
        db: Base de données MongoDB
        user_id: ID de l'utilisateur qui envoie le SMS
        recipient_number: Numéro de téléphone du destinataire
        message: Contenu du message
        recipient_id: ID du contact (optionnel)
        
    Returns:
        SMSMessage: L'objet SMS créé avec les détails de l'envoi
    """
    # Créer l'objet SMS en base de données (avec statut initial "pending")
    db_sms = SMSMessage(
        content=message,
        recipient_number=recipient_number,
        sender_id=user_id,
        recipient_id=recipient_id,
        status="pending"
    )
    
    # Sauvegarder l'objet dans MongoDB
    await db_sms.save()
    
    try:
        # Appel à l'API Orange pour envoyer le SMS
        response = await orange_sms_service.send_sms(recipient_number, message)
        
        # Extraire l'ID du message de la réponse
        # Format de réponse attendu de l'API Orange:
        # {"outboundSMSMessageRequest": {"resourceURL": "URL_AVEC_ID"}}
        resource_url = response.get("outboundSMSMessageRequest", {}).get("resourceURL", "")
        message_id = resource_url.split("/")[-1] if resource_url else None
        
        # Mettre à jour le statut et l'ID du message
        db_sms.status = "sent"
        db_sms.message_id = message_id
        await db_sms.save()
        
    except Exception as e:
        # En cas d'erreur, mettre à jour le statut
        db_sms.status = "failed"
        await db_sms.save()
        # Re-lever l'exception pour la gestion d'erreur de l'API
        raise e
    
    return db_sms


async def check_sms_status(db: AsyncIOMotorDatabase, sms_id: str) -> Dict:
    """
    Vérifie le statut de livraison d'un SMS auprès de l'API Orange
    
    Args:
        db: Base de données MongoDB
        sms_id: ID du SMS dans notre base de données
        
    Returns:
        Dict: Statut de livraison
    """
    # Récupérer le SMS depuis la base de données
    db_sms = await SMSMessage.get(PydanticObjectId(sms_id))
    if not db_sms or not db_sms.message_id:
        raise ValueError(f"SMS non trouvé ou sans ID de message: {sms_id}")
    
    # Vérifier le statut auprès de l'API Orange
    status_response = await orange_sms_service.get_sms_delivery_status(db_sms.message_id)
    
    # Analyser la réponse et mettre à jour le statut
    delivery_info = status_response.get("deliveryInfos", {})
    delivery_status = delivery_info.get("deliveryStatus", "")
    
    # Mapping des statuts Orange vers nos statuts internes
    status_mapping = {
        "DeliveredToTerminal": "delivered",
        "DeliveredToNetwork": "delivered",
        "MessageWaiting": "sending",
        "DeliveryImpossible": "failed"
    }
    
    new_status = status_mapping.get(delivery_status, db_sms.status)
    
    # Mettre à jour le statut en base de données si nécessaire
    if new_status != db_sms.status:
        db_sms.status = new_status
        await db_sms.save()
    
    return {
        "message_id": db_sms.message_id,
        "status": new_status,
        "delivery_status": delivery_status,
        "details": delivery_info
    }
