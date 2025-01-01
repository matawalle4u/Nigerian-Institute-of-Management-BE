/**
 * General response structure from Paystack API.
 * @template T - Type of the data field in the response.
 */
export interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

/**
 * Data returned by Paystack when initiating a payment.
 */
export interface PaymentData {
  authorization_url: string;
  access_code: string;
  reference: string;
  amount: number;
  call_back_url: string;
  status: string;
}
