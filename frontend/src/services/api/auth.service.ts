import { ApiResponse, LoginRequest, Token, User, UserCreate } from '../../types/api';
import axios from 'axios';
import BaseApiService from './base';

// Formater les données en URLSearchParams pour OAuth2 (exigé par FastAPI)
function formatLoginData(credentials: LoginRequest): URLSearchParams {
  const params = new URLSearchParams();
  params.append('username', credentials.username); // L'API attend 'username' même si c'est un email
  params.append('password', credentials.password);
  return params;
}

class AuthService extends BaseApiService {
  async login(credentials: LoginRequest): Promise<ApiResponse<Token>> {
    try {
      // Utiliser URLSearchParams pour OAuth2
      const formData = formatLoginData(credentials);
      
      // Utiliser l'instance API de la classe de base qui a la bonne URL
      const response = await this.api.post('/auth/login/access-token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Si la requête réussit, stocker le token
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        return {
          data: response.data as Token,
          success: true
        };
      }
      
      return {
        success: true,
        data: response.data as Token
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur lors de la connexion';
      
      // Gestion des erreurs spécifiques de l'API
      if (axios.isAxiosError(error) && error.response) {
        // Erreur 401 = Email ou mot de passe incorrect
        if (error.response.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.response.status === 400) {
          errorMessage = 'Informations de connexion invalides';
        }
        
        // Si le backend renvoie un message d'erreur spécifique
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  async signup(userData: UserCreate): Promise<ApiResponse<User>> {
    try {
      // Utiliser l'instance API de la classe de base qui a la bonne URL
      const response = await this.api.post('/auth/signup', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return {
        success: true,
        data: response.data as User
      };
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      let errorMessage = 'Erreur lors de l\'inscription';
      
      // Gestion spécifique des erreurs du backend
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.detail || errorMessage;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirection vers la page de login si nécessaire
    window.location.href = '/login';
  }
  
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}

export const authService = new AuthService();
export default authService;
