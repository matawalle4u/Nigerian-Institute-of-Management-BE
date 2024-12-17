export class PaymentHistoryDto {
  date: Date;
  billName: string;
  description: string;
  amount: number;
}
export class OutstandingPaymentDto {
  date: Date;
  billName: string;
  amount: number;
}
