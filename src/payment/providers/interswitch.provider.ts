import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';
import { getAuthData } from '../helpers/interswitch-auth';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string; // Optional: "Bearer"
}

@Injectable()
export class InterswitchProvider implements PaymentProvider {
  private readonly interswitchBaseUrl = process.env.INTERSWITCH_URL;
  private readonly interswitchSecretKey = process.env.INTERSWITCH_SECRET_KEY;
  private readonly interswitchClientId = process.env.INTERSWITCH_CLIENT_ID;
  private readonly interswitchToken = process.env.INTERSWITCH_CLIENT_TOKEN;

  private readonly tokenUrl =
    'https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials'; // Adjust based on environment
  private readonly clientId = '<your_client_id>';
  private readonly clientSecret = process.env.NTERSWITCH_SECRET_KEY;
  private readonly baseUrl = 'https://qa.interswitchng.com/api/v3/purchases';

  async initializePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    const authData = process.env.INTERSWITCH_TEST_AUTH_DATA;
    const token = await this.getAccessToken();

    
    const { customerId, amount, ...otherFields } = initiatePaymentDto; // Destructure necessary fields
    const purchasePayload = {
      ...otherFields,
      customerId,
      authData,
      amount,
    };
    //console.log(purchasePayload, token);
    try {
      const response = await axios.post(this.baseUrl, purchasePayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      return await response.data;
    } catch (error) {
      console.error(error.response?.data);
    }
  }

  async getAccessToken(): Promise<string> {
    try {
      const concatenatedString = `${this.interswitchClientId}:${this.interswitchSecretKey}`;
      const encodedString = btoa(concatenatedString);
      //console.log(encodedString);

      const options = {
        pan: '6280511000000095',
        expDate: '5004',
        cvv: '111',
        pin: '1111',
      };

      // 5061 0502 6581 9556 486
      // Valid 01/26
      // CVV 112

      const auu = getAuthData(options);
      console.log(auu);

      const headers = {
        Authorization: `Basic ${encodedString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      const data = new URLSearchParams({
        grant_type: 'client_credentials',
      }).toString();

      const response = await axios.post<TokenResponse>(this.tokenUrl, data, {
        headers,
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch access token');
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    const response = await axios.get(
      `${this.interswitchBaseUrl}/transactions/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.interswitchSecretKey}` },
      },
    );
    return response.data;
  }

  async handleWebhook(data: any): Promise<void> {
    // Handle Interswitch webhook logic here
    console.log(data);
  }

  // const axios = require('axios');

  async authenticate() {
    const url =
      'https://passport.k8.isw.la/passport/oauth/token?grant_type=client_credentials';

    const headers = {
      Authorization: `Basic ${this.interswitchToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Define the payload
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    axios
      .post(url, data, { headers })
      .then((response) => {
        console.log('Response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response?.data || error.message);
      });
  }
}
