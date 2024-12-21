/**
 * General response structure from Paystack API.
 * @template T - Type of the data field in the response.
 */
export interface PaystackResponse<T> {
  status: boolean; // Indicates success or failure
  message: string; // API response message
  data: T; // Contains the actual payload
}

/**
 * Data returned by Paystack when initiating a payment.
 */
export interface PaymentData {
  authorization_url: string; // URL to redirect user for payment
  access_code: string; // Access code for the transaction
  reference: string; // Unique transaction reference
}