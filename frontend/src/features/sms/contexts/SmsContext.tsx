import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { SMS, SMSSend } from '../../../types/api';
import smsService from '../../../services/api/sms.service';

// Types pour l'état et les actions
type SmsState = {
  smsHistory: SMS[];
  currentSms: SMS | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  totalCount: number;
};

type SmsAction =
  | { type: 'SEND_SMS_REQUEST' }
  | { type: 'SEND_SMS_SUCCESS'; payload: SMS }
  | { type: 'SEND_SMS_FAILURE'; payload: string }
  | { type: 'FETCH_SMS_HISTORY_REQUEST' }
  | { type: 'FETCH_SMS_HISTORY_SUCCESS'; payload: { smsHistory: SMS[]; totalCount: number } }
  | { type: 'FETCH_SMS_HISTORY_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_SMS'; payload: SMS }
  | { type: 'CLEAR_CURRENT_SMS' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_SUCCESS' };

// État initial
const initialState: SmsState = {
  smsHistory: [],
  currentSms: null,
  isLoading: false,
  error: null,
  success: null,
  totalCount: 0,
};

// Réducteur pour gérer les actions
const smsReducer = (state: SmsState, action: SmsAction): SmsState => {
  switch (action.type) {
    case 'SEND_SMS_REQUEST':
    case 'FETCH_SMS_HISTORY_REQUEST':
      return { ...state, isLoading: true, error: null, success: null };
    
    case 'SEND_SMS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        success: 'SMS envoyé avec succès',
        smsHistory: [action.payload, ...state.smsHistory],
        totalCount: state.totalCount + 1,
      };
    
    case 'FETCH_SMS_HISTORY_SUCCESS':
      return {
        ...state,
        isLoading: false,
        smsHistory: action.payload.smsHistory,
        totalCount: action.payload.totalCount,
      };
    
    case 'SEND_SMS_FAILURE':
    case 'FETCH_SMS_HISTORY_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'SET_CURRENT_SMS':
      return {
        ...state,
        currentSms: action.payload,
      };
    
    case 'CLEAR_CURRENT_SMS':
      return {
        ...state,
        currentSms: null,
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
type SmsContextType = {
  state: SmsState;
  sendSms: (smsData: SMSSend) => Promise<void>;
  fetchSmsHistory: (skip?: number, limit?: number) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
};

// Création du contexte
const SmsContext = createContext<SmsContextType | undefined>(undefined);

// Provider du contexte
export const SmsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(smsReducer, initialState);
  
  // Fonction pour envoyer un SMS
  const sendSms = useCallback(async (smsData: SMSSend) => {
    dispatch({ type: 'SEND_SMS_REQUEST' });
    
    try {
      const response = await smsService.sendSMS(smsData);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'SEND_SMS_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ 
          type: 'SEND_SMS_FAILURE', 
          payload: response.message || 'Échec de l\'envoi du SMS' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'SEND_SMS_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'envoi du SMS' 
      });
    }
  }, []);
  
  // Fonction pour récupérer l'historique des SMS
  const fetchSmsHistory = useCallback(async (skip: number = 0, limit: number = 100) => {
    dispatch({ type: 'FETCH_SMS_HISTORY_REQUEST' });
    
    try {
      const response = await smsService.getSMSHistory(skip, limit);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'FETCH_SMS_HISTORY_SUCCESS', 
          payload: { 
            smsHistory: response.data,
            totalCount: response.data.length // Idéalement, l'API devrait renvoyer le nombre total
          } 
        });
      } else {
        dispatch({ 
          type: 'FETCH_SMS_HISTORY_FAILURE', 
          payload: response.message || 'Échec de la récupération de l\'historique' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'FETCH_SMS_HISTORY_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la récupération de l\'historique' 
      });
    }
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
    <SmsContext.Provider value={{ 
      state, 
      sendSms, 
      fetchSmsHistory, 
      clearError, 
      clearSuccess 
    }}>
      {children}
    </SmsContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useSms = () => {
  const context = useContext(SmsContext);
  if (context === undefined) {
    throw new Error('useSms doit être utilisé à l\'intérieur d\'un SmsProvider');
  }
  return context;
};
