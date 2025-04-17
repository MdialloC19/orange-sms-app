import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, LoginRequest, UserCreate } from '../../../types/api';
import authService from '../../../services/api/auth.service';

// Types pour l'état et les actions
type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'SIGNUP_REQUEST' }
  | { type: 'SIGNUP_SUCCESS'; payload: User }
  | { type: 'SIGNUP_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// État initial
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// Réducteur pour gérer les actions
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
    case 'SIGNUP_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        token: action.payload.token,
        error: null,
      };
    
    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    
    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Type pour le contexte
type AuthContextType = {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  clearError: () => void;
};

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider du contexte
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // Fonction pour se connecter
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { token: response.data.access_token } 
        });
        // Idéalement, nous récupérerions les infos de l'utilisateur ici 
        // Mais notre API actuelle ne le permet pas directement
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: response.message || 'Email ou mot de passe incorrect' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion' 
      });
    }
  };
  
  // Fonction pour s'inscrire
  const signup = async (userData: UserCreate) => {
    dispatch({ type: 'SIGNUP_REQUEST' });
    
    try {
      const response = await authService.signup(userData);
      
      if (response.success && response.data) {
        dispatch({ 
          type: 'SIGNUP_SUCCESS', 
          payload: response.data 
        });
      } else {
        dispatch({ 
          type: 'SIGNUP_FAILURE', 
          payload: response.message || 'Échec de l\'inscription' 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'SIGNUP_FAILURE', 
        payload: error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription' 
      });
    }
  };
  
  // Fonction pour se déconnecter
  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };
  
  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };
  
  // Vérification de l'authentification lors du montage du composant
  useEffect(() => {
    // Si nous avions un endpoint pour récupérer l'utilisateur courant, nous l'utiliserions ici
    // C'est un point d'amélioration pour l'API backend
  }, []);
  
  return (
    <AuthContext.Provider value={{ state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
