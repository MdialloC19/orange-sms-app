"""
Utilitaires pour la validation et le formatage des numéros de téléphone sénégalais.
"""
import re
from typing import Tuple


def validate_senegal_phone(phone_number: str) -> Tuple[bool, str]:
    """
    Valide et formate un numéro de téléphone sénégalais.
    
    Args:
        phone_number: Numéro de téléphone à valider
    
    Returns:
        Tuple contenant (est_valide, numéro_formaté)
    """
    # Nettoyer le numéro (supprimer espaces, tirets, parenthèses)
    cleaned = re.sub(r'[\s\-\.\(\)]', '', phone_number)
    
    # Vérifier si c'est un numéro sénégalais valide
    # Format valide: +221 7X XXX XX XX, où X est 0,5,6,7,8
    senegal_regex = r'^(\+221|221)?([7][0,5-8]\d{7})$'
    match = re.match(senegal_regex, cleaned)
    
    if not match:
        return False, phone_number
    
    # Récupérer le numéro sans l'indicatif
    local_number = match.group(2)
    
    # Formater au format international
    formatted = f"+221{local_number}"
    
    # Vérifier si c'est un numéro valide de Senegal (commence par 70, 75, 76, 77, 78)
    if not re.match(r'^\+221[7][0,5-8]', formatted):
        return False, phone_number
    
    return True, formatted
