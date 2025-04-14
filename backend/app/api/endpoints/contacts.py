from typing import Any, List
from beanie import PydanticObjectId

from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api import schemas
from app.core.deps import get_current_user
from app.db import models
from app.db.database import get_db

router = APIRouter()


@router.get(
    "/",
    response_model=List[schemas.Contact],
    summary="Lister tous les contacts",
    description="""
    Récupère la liste des contacts de l'utilisateur courant, triés par nom.
    
    **Paramètres**:
    - skip: Nombre d'éléments à sauter (pour la pagination)
    - limit: Nombre maximum d'éléments à retourner (par défaut: 100)
    
    **Réponse**:
    - Liste d'objets Contact avec leurs détails
    """
)
async def read_contacts(
    skip: int = 0,
    limit: int = 100,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Récupère la liste des contacts de l'utilisateur
    """
    contacts = await models.Contact.find(
        {"owner_id": str(current_user.id)}
    ).sort("name").skip(skip).limit(limit).to_list()
    return contacts


@router.post(
    "/",
    response_model=schemas.Contact,
    summary="Créer un nouveau contact",
    description="""
    Crée un nouveau contact dans la liste de l'utilisateur.
    
    **Requête**:
    - name: Nom du contact
    - phone_number: Numéro de téléphone (format international)
    - email: Email du contact (optionnel)
    - notes: Notes supplémentaires (optionnel)
    
    **Réponse**:
    - Détails complets du contact créé
    
    **Code d'erreur**:
    - 400: Un contact avec ce numéro existe déjà
    """
)
async def create_contact(
    *,
    db: AsyncIOMotorDatabase = Depends(get_db),
    contact_in: schemas.ContactCreate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Crée un nouveau contact
    """
    # Vérifier si le contact existe déjà (même numéro pour le même utilisateur)
    existing_contact = await models.Contact.find_one(
        {
            "owner_id": str(current_user.id),
            "phone_number": contact_in.phone_number
        }
    )
    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un contact avec ce numéro existe déjà"
        )
    
    # Créer le nouveau contact
    db_contact = models.Contact(
        **contact_in.dict(),
        owner_id=str(current_user.id)
    )
    await db_contact.save()
    
    return db_contact


@router.get(
    "/{contact_id}",
    response_model=schemas.Contact,
    summary="Détails d'un contact spécifique",
    description="""
    Récupère les détails complets d'un contact spécifique.
    
    **Paramètres**:
    - contact_id: Identifiant unique du contact
    
    **Réponse**:
    - Détails complets du contact
    
    **Code d'erreur**:
    - 404: Contact non trouvé ou ID invalide
    """
)
async def read_contact(
    contact_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Récupère les détails d'un contact spécifique
    """
    try:
        contact = await models.Contact.get(PydanticObjectId(contact_id))
        if not contact or contact.owner_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )
        return contact
    except (ValueError, HTTPException):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact non trouvé ou ID invalide"
        )


@router.put(
    "/{contact_id}",
    response_model=schemas.Contact,
    summary="Mettre à jour un contact",
    description="""
    Met à jour les informations d'un contact existant.
    
    **Paramètres**:
    - contact_id: Identifiant unique du contact
    
    **Requête**:
    - name: Nouveau nom (optionnel)
    - phone_number: Nouveau numéro (optionnel)
    - email: Nouvel email (optionnel)
    - notes: Nouvelles notes (optionnel)
    
    **Réponse**:
    - Détails mis à jour du contact
    
    **Code d'erreur**:
    - 404: Contact non trouvé
    - 400: Un contact avec ce numéro existe déjà
    """
)
async def update_contact(
    *,
    db: AsyncIOMotorDatabase = Depends(get_db),
    contact_id: str,
    contact_in: schemas.ContactUpdate,
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Met à jour un contact existant
    """
    try:
        contact = await models.Contact.get(PydanticObjectId(contact_id))
        if not contact or contact.owner_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )
        
        # Vérifier si le nouveau numéro existe déjà chez un autre contact
        if contact_in.phone_number and contact_in.phone_number != contact.phone_number:
            existing_contact = await models.Contact.find_one(
                {
                    "owner_id": str(current_user.id),
                    "phone_number": contact_in.phone_number,
                    "_id": {"$ne": PydanticObjectId(contact_id)}
                }
            )
            if existing_contact:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un contact avec ce numéro existe déjà"
                )
        
        # Mettre à jour les champs
        update_data = contact_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(contact, field, value)
        
        await contact.save()
        
        return contact
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact non trouvé ou ID invalide"
        )


@router.delete(
    "/{contact_id}",
    response_model=schemas.Contact,
    summary="Supprimer un contact",
    description="""
    Supprime un contact de la liste de l'utilisateur.
    
    **Paramètres**:
    - contact_id: Identifiant unique du contact
    
    **Réponse**:
    - Détails du contact supprimé
    
    **Code d'erreur**:
    - 404: Contact non trouvé ou ID invalide
    """
)
async def delete_contact(
    contact_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
) -> Any:
    """
    Supprime un contact
    """
    try:
        contact = await models.Contact.get(PydanticObjectId(contact_id))
        if not contact or contact.owner_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact non trouvé"
            )
        
        await contact.delete()
        return contact
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact non trouvé ou ID invalide"
        )
