// Types pour les modèles de données de l'API
export interface User {
  id: string;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  phone_number: string;
  notes?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface SMS {
  id: string;
  content: string;
  recipient_number: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  message_id?: string;
  sender_id: string;
  recipient_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SMSDeliveryStatus {
  message_id: string;
  status: string;
  delivery_status?: string;
  details?: Record<string, any>;
}

// Types pour les requêtes d'API
export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
}

export interface ContactCreate {
  name: string;
  phone_number: string;
  notes?: string;
}

export interface ContactUpdate {
  name?: string;
  phone_number?: string;
  notes?: string;
}

export interface SMSSend {
  recipient_number: string;
  message: string;
  recipient_id?: string;
}

export interface LoginRequest {
  username: string; // En réalité c'est l'email
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Types pour les réponses d'API
export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  detail: string;
  status_code?: number;
}
