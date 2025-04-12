from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# Base schemas for User
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    password: Optional[str] = None


class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


class User(UserInDBBase):
    pass


class UserInDB(UserInDBBase):
    hashed_password: str


# Base schemas for Token
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None


# Base schemas for Contact
class ContactBase(BaseModel):
    name: str
    phone_number: str
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(ContactBase):
    name: Optional[str] = None
    phone_number: Optional[str] = None


class ContactInDBBase(ContactBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Contact(ContactInDBBase):
    pass


# Base schemas for SMS
class SMSBase(BaseModel):
    content: str
    recipient_number: str
    recipient_id: Optional[int] = None


class SMSCreate(SMSBase):
    pass


class SMSUpdate(SMSBase):
    content: Optional[str] = None
    status: Optional[str] = None


class SMSInDBBase(SMSBase):
    id: int
    sender_id: int
    status: str
    message_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class SMS(SMSInDBBase):
    pass


# Schema for SMS Sending
class SMSSend(BaseModel):
    recipient_number: str = Field(..., description="Numéro de téléphone du destinataire")
    message: str = Field(..., description="Contenu du message")
    recipient_id: Optional[int] = Field(None, description="ID du contact (optionnel)")


# Schema for SMS Delivery Status
class SMSDeliveryStatus(BaseModel):
    message_id: str
    status: str
    delivery_time: Optional[datetime] = None
