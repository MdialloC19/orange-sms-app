from datetime import datetime
from typing import List, Optional

from beanie import Document, Indexed, Link, before_event, Insert, Replace, SaveChanges
from pydantic import Field, EmailStr


class User(Document):
    email: Indexed(str, unique=True)  # Email unique indexé
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "full_name"
        ]
    
    @before_event([Replace, SaveChanges])
    def update_timestamp(self):
        self.updated_at = datetime.utcnow()


class Contact(Document):
    name: str
    phone_number: Indexed(str)  # Numéro de téléphone indexé
    notes: Optional[str] = None
    owner_id: str  # ID de l'utilisateur propriétaire
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "contacts"
        indexes = [
            "name",
            "phone_number",
            "owner_id"
        ]
    
    @before_event([Replace, SaveChanges])
    def update_timestamp(self):
        self.updated_at = datetime.utcnow()


class SMSMessage(Document):
    content: str  # Contenu du message
    recipient_number: str  # Le numéro de téléphone du destinataire
    status: str = "pending"  # "pending", "sent", "delivered", "failed"
    message_id: Optional[str] = None  # ID de retour de l'API Orange
    sender_id: str  # ID de l'utilisateur expéditeur
    recipient_id: Optional[str] = None  # ID du contact destinataire (si applicable)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "sms_messages"
        indexes = [
            "sender_id",
            "recipient_id",
            "status",
            "created_at"
        ]
    
    @before_event([Replace, SaveChanges])
    def update_timestamp(self):
        self.updated_at = datetime.utcnow()
