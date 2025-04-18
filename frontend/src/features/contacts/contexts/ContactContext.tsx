import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Contact, ContactCreate, ContactUpdate } from '../../../types/api';
import contactService from '../../../services/api/contact.service';

// Types pour l'état et les actions
type ContactState = {
  contacts: Contact[];
  currentContact: Contact | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
};

type ContactAction =
  | { type: 'FETCH_CONTACTS_REQUEST' }
  | { type: 'FETCH_CONTACTS_SUCCESS'; payload: Contact[] }
  | { type: 'FETCH_CONTACTS_FAILURE'; payload: string }
  | { type: 'CREATE_CONTACT_REQUEST' }
  | { type: 'CREATE_CONTACT_SUCCESS'; payload: Contact }
  | { type: 'CREATE_CONTACT_FAILURE'; payload: string }
  | { type: 'UPDATE_CONTACT_REQUEST' }
  | { type: 'UPDATE_CONTACT_SUCCESS'; payload: Contact }
  | { type: 'UPDATE_CONTACT_FAILURE'; payload: string }
  | { type: 'DELETE_CONTACT_REQUEST' }
  | { type: 'DELETE_CONTACT_SUCCESS'; payload: string }
  | { type: 'DELETE_CONTACT_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_CONTACT'; payload: Contact }
  | { type: 'CLEAR_CURRENT_CONTACT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_SUCCESS' };

// État initial
const initialState: ContactState = {
  contacts: [],
  currentContact: null,
  isLoading: false,
  error: null,
  success: null,
};

// Réducteur pour gérer les actions
const contactReducer = (state: ContactState, action: ContactAction): ContactState => {
  switch (action.type) {
    case 'FETCH_CONTACTS_REQUEST':
    case 'CREATE_CONTACT_REQUEST':
    case 'UPDATE_CONTACT_REQUEST':
    case 'DELETE_CONTACT_REQUEST':
      return { ...state, isLoading: true, error: null, success: null };
    
    case 'FETCH_CONTACTS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        contacts: action.payload,
      };
    
    case 'CREATE_CONTACT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        contacts: [...state.contacts, action.payload],
        success: 'Contact créé avec succès',
        currentContact: null,
      };
    
    case 'UPDATE_CONTACT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        contacts: state.contacts.map(contact => 
          contact.id === action.payload.id ? action.payload : contact
        ),
        success: 'Contact mis à jour avec succès',
        currentContact: null,
      };
    
    case 'DELETE_CONTACT_SUCCESS':
      return {
        ...state,
        isLoading: false,
        contacts: state.contacts.filter(contact => contact.id !== action.payload),
        success: 'Contact supprimé avec succès',
      };
    
    case 'FETCH_CONTACTS_FAILURE':
    case 'CREATE_CONTACT_FAILURE':
    case 'UPDATE_CONTACT_FAILURE':
    case 'DELETE_CONTACT_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'SET_CURRENT_CONTACT':
      return {
        ...state,
        currentContact: action.payload,
      };
    
    case 'CLEAR_CURRENT_CONTACT':
      return {
        ...state,
        currentContact: null,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    case 'CLEAR_SUCCESS':
      return {
        ...state,
        success: null,
      };
    
    default:
      return state;
  }
};

// Type pour le contexte
type ContactContextType = {
  state: ContactState;
  fetchContacts: () => Promise<void>;
  createContact: (contactData: ContactCreate) => Promise<void>;
  updateContact: (contactId: string, contactData: ContactUpdate) => Promise<void>;
  deleteContact: (contactId: string) => Promise<void>;
  setCurrentContact: (contact: Contact) => void;
  clearCurrentContact: () => void;
  clearError: () => void;
  clearSuccess: () => void;
};

// Création du contexte
const ContactContext = createContext<ContactContextType | undefined>(undefined);

// Provider du contexte
export const ContactProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(contactReducer, initialState);
  
  // Fonction pour récupérer les contacts
  const fetchContacts = useCallback(async () => {
    dispatch({ type: 'FETCH_CONTACTS_REQUEST' });
    
    try {
      const response = await contactService.getContacts();
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'FETCH_CONTACTS_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ 
          type: 'FETCH_CONTACTS_FAILURE', 
          payload: response.message || 'Échec de la récupération des contacts' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'FETCH_CONTACTS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération des contacts' 
      });
    }
  }, []);
  
  // Fonction pour créer un contact
  const createContact = useCallback(async (contactData: ContactCreate) => {
    dispatch({ type: 'CREATE_CONTACT_REQUEST' });
    
    try {
      const response = await contactService.createContact(contactData);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'CREATE_CONTACT_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ 
          type: 'CREATE_CONTACT_FAILURE', 
          payload: response.message || 'Échec de la création du contact' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'CREATE_CONTACT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du contact' 
      });
    }
  }, []);
  
  // Fonction pour mettre à jour un contact
  const updateContact = useCallback(async (contactId: string, contactData: ContactUpdate) => {
    dispatch({ type: 'UPDATE_CONTACT_REQUEST' });
    
    try {
      const response = await contactService.updateContact(contactId, contactData);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'UPDATE_CONTACT_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ 
          type: 'UPDATE_CONTACT_FAILURE', 
          payload: response.message || 'Échec de la mise à jour du contact' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'UPDATE_CONTACT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du contact' 
      });
    }
  }, []);
  
  // Fonction pour supprimer un contact
  const deleteContact = useCallback(async (contactId: string) => {
    dispatch({ type: 'DELETE_CONTACT_REQUEST' });
    
    try {
      const response = await contactService.deleteContact(contactId);
      
      if (response.success) {
        dispatch({ 
          type: 'DELETE_CONTACT_SUCCESS', 
          payload: contactId 
        });
      } else {
        dispatch({ 
          type: 'DELETE_CONTACT_FAILURE', 
          payload: response.message || 'Échec de la suppression du contact' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'DELETE_CONTACT_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du contact' 
      });
    }
  }, []);
  
  // Fonction pour définir le contact actuel
  const setCurrentContact = useCallback((contact: Contact) => {
    dispatch({ type: 'SET_CURRENT_CONTACT', payload: contact });
  }, []);
  
  // Fonction pour effacer le contact actuel
  const clearCurrentContact = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT_CONTACT' });
  }, []);
  
  // Fonction pour effacer les erreurs
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  
  // Fonction pour effacer les messages de succès
  const clearSuccess = useCallback(() => {
    dispatch({ type: 'CLEAR_SUCCESS' });
  }, []);
  
  return (
    <ContactContext.Provider value={{ 
      state, 
      fetchContacts, 
      createContact, 
      updateContact, 
      deleteContact, 
      setCurrentContact, 
      clearCurrentContact, 
      clearError, 
      clearSuccess 
    }}>
      {children}
    </ContactContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useContact = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContact doit être utilisé à l\'intérieur d\'un ContactProvider');
  }
  return context;
};
