// src/payment/interfaces/payment-provider.interface.ts
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
export interface PaymentProvider {
  initializePayment(initiatePaymentDto: InitiatePaymentDto): Promise<any>;
  verifyPayment(reference: string): Promise<any>;
  handleWebhook(data: any): Promise<void>;
}
