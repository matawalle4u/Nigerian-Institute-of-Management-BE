import { Injectable } from '@nestjs/common';
import { PaystackProvider } from './paystack.provider';
import { InterswitchProvider } from './interswitch.provider';
import { PaymentProvider } from '../interfaces/payment-provider.interface';

@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly paystackProvider: PaystackProvider,
    private readonly interswitchProvider: InterswitchProvider,
  ) {}

  getProvider(provider: 'paystack' | 'interswitch'): PaymentProvider {
    switch (provider) {
      case 'paystack':
        return this.paystackProvider;
      case 'interswitch':
        return this.interswitchProvider;
      default:
        throw new Error('Unsupported payment provider');
    }
  }
}
