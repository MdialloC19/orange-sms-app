import { ApiResponse, Contact, ContactCreate, ContactUpdate } from '../../types/api';
import BaseApiService from './base';

class ContactService extends BaseApiService {
  /**
   * Récupère la liste des contacts de l'utilisateur
   */
  async getContacts(): Promise<ApiResponse<Contact[]>> {
    return await this.get<Contact[]>('/contacts/');
  }

  /**
   * Récupère les détails d'un contact spécifique
   */
  async getContactById(contactId: string): Promise<ApiResponse<Contact>> {
    return await this.get<Contact>(`/contacts/${contactId}`);
  }

  /**
   * Crée un nouveau contact
   */
  async createContact(contactData: ContactCreate): Promise<ApiResponse<Contact>> {
    return await this.post<Contact>('/contacts/', contactData);
  }

  /**
   * Met à jour un contact existant
   */
  async updateContact(contactId: string, contactData: ContactUpdate): Promise<ApiResponse<Contact>> {
    return await this.put<Contact>(`/contacts/${contactId}`, contactData);
  }

  /**
   * Supprime un contact
   */
  async deleteContact(contactId: string): Promise<ApiResponse<void>> {
    return await this.delete<void>(`/contacts/${contactId}`);
  }
}

export const contactService = new ContactService();
export default contactService;
