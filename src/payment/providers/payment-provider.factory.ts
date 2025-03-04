import { Injectable } from '@nestjs/common';
import { PaystackProvider } from './paystack.provider';
import { InterswitchProvider } from './interswitch.provider';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { RemitaProvider } from './remita.provider';

@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly paystackProvider: PaystackProvider,
    private readonly interswitchProvider: InterswitchProvider,
    private readonly remitaProvider: RemitaProvider,
  ) {}

  getProvider(
    provider: 'paystack' | 'interswitch' | 'remita',
  ): PaymentProvider {
    switch (provider) {
      case 'paystack':
        return this.paystackProvider;
      case 'interswitch':
        return this.interswitchProvider;
      case 'remita':
        return this.remitaProvider;
      default:
        throw new Error('Unsupported payment provider');
    }
  }
}
