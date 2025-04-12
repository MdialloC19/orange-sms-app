import base64
import json
import logging
from typing import Dict, Optional

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)


class OrangeSMSService:
    """
    Service pour interagir avec l'API SMS d'Orange Sénégal.
    Cette classe gère l'authentification et l'envoi de SMS.
    """
    
    def __init__(self):
        self.client_id = settings.ORANGE_CLIENT_ID
        self.client_secret = settings.ORANGE_CLIENT_SECRET
        self.auth_url = settings.ORANGE_AUTH_URL
        self.sms_url = settings.ORANGE_SMS_URL
        self.access_token = None
        self.sender_name = settings.ORANGE_SENDER_NAME
    
    async def get_access_token(self) -> str:
        """
        Obtient un token d'accès en utilisant les identifiants OAuth.
        Utilise l'authentification Basic avec client_id et client_secret.
        """
        if not self.client_id or not self.client_secret:
            raise HTTPException(
                status_code=500,
                detail="Les identifiants Orange API (client_id et client_secret) ne sont pas configurés."
            )
            
        try:
            # Créer les identifiants Basic Auth
            credentials = f"{self.client_id}:{self.client_secret}"
            encoded_credentials = base64.b64encode(credentials.encode()).decode()
            
            headers = {
                "Authorization": f"Basic {encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
            
            data = {"grant_type": "client_credentials"}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.auth_url,
                    headers=headers,
                    data=data
                )
                
                if response.status_code != 200:
                    logger.error(f"Erreur lors de l'authentification Orange API: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Échec de l'authentification Orange API: {response.text}"
                    )
                
                result = response.json()
                self.access_token = result.get("access_token")
                return self.access_token
                
        except Exception as e:
            logger.error(f"Exception lors de l'authentification Orange API: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de l'authentification Orange API: {str(e)}"
            )
    
    async def send_sms(self, phone_number: str, message: str) -> Dict:
        """
        Envoie un SMS à un numéro de téléphone spécifié.
        
        Args:
            phone_number: Numéro de téléphone du destinataire (format international)
            message: Contenu du SMS
            
        Returns:
            Dict: Réponse de l'API Orange
        """
        if not self.access_token:
            await self.get_access_token()
            
        # Formater le numéro de téléphone au format international si nécessaire
        if not phone_number.startswith("+"):
            # Supposons que c'est un numéro sénégalais
            phone_number = "+221" + phone_number.lstrip("0")
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        # Format spécifique requis par l'API Orange
        payload = {
            "outboundSMSMessageRequest": {
                "address": f"tel:{phone_number}",
                "senderAddress": f"tel:{self.sender_name}",
                "outboundSMSTextMessage": {
                    "message": message
                }
            }
        }
        
        try:
            # Construction de l'URL complète (varie selon le pays)
            country_code = "sn"  # Code pays pour le Sénégal
            sms_endpoint = f"{self.sms_url}/requests"
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    sms_endpoint,
                    headers=headers,
                    json=payload
                )
                
                if response.status_code not in (201, 200):
                    logger.error(f"Erreur lors de l'envoi du SMS: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Échec de l'envoi du SMS: {response.text}"
                    )
                    
                return response.json()
                
        except Exception as e:
            logger.error(f"Exception lors de l'envoi du SMS: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de l'envoi du SMS: {str(e)}"
            )
            
    async def get_sms_delivery_status(self, message_id: str) -> Dict:
        """
        Vérifie le statut de livraison d'un SMS.
        
        Args:
            message_id: ID du message retourné lors de l'envoi
            
        Returns:
            Dict: Statut de livraison
        """
        if not self.access_token:
            await self.get_access_token()
            
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json"
        }
        
        try:
            # Construction de l'URL pour vérifier le statut
            country_code = "sn"  # Code pays pour le Sénégal
            status_endpoint = f"{self.sms_url}/requests/{message_id}/deliveryInfos"
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    status_endpoint,
                    headers=headers
                )
                
                if response.status_code != 200:
                    logger.error(f"Erreur lors de la vérification du statut: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Échec de la vérification du statut: {response.text}"
                    )
                    
                return response.json()
                
        except Exception as e:
            logger.error(f"Exception lors de la vérification du statut: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de la vérification du statut: {str(e)}"
            )


# Instance singleton pour l'utilisation dans l'application
orange_sms_service = OrangeSMSService()
