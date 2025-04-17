import { ApiResponse, SMS, SMSDeliveryStatus, SMSSend } from '../../types/api';
import BaseApiService from './base';

class SMSService extends BaseApiService {
  /**
   * Envoie un SMS via l'API Orange
   */
  async sendSMS(smsData: SMSSend): Promise<ApiResponse<SMS>> {
    return await this.post<SMS>('/sms/send', smsData);
  }

  /**
   * Récupère l'historique des SMS envoyés
   */
  async getSMSHistory(skip: number = 0, limit: number = 100): Promise<ApiResponse<SMS[]>> {
    return await this.get<SMS[]>(`/sms/history?skip=${skip}&limit=${limit}`);
  }

  /**
   * Récupère les détails d'un SMS spécifique
   */
  async getSMSDetails(smsId: string): Promise<ApiResponse<SMS>> {
    return await this.get<SMS>(`/sms/${smsId}`);
  }

  /**
   * Vérifie le statut de livraison d'un SMS
   */
  async checkSMSStatus(smsId: string): Promise<ApiResponse<SMSDeliveryStatus>> {
    return await this.get<SMSDeliveryStatus>(`/sms/${smsId}/status`);
  }
}

export const smsService = new SMSService();
export default smsService;
