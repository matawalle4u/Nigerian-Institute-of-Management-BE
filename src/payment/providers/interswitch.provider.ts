import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentProvider } from '../interfaces/payment-provider.interface';
import { InitiatePaymentDto } from '../dto/initiate-payment.dto';

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

  private readonly tokenUrl = 'https://qa.interswitchng.com/api/v1/token'; // Adjust based on environment
  private readonly clientId = '<your_client_id>';
  private readonly clientSecret = process.env.NTERSWITCH_SECRET_KEY;
  private readonly baseUrl = 'https://qa.interswitchng.com/api/v3/purchases';

  async initializePayment(
    initiatePaymentDto: InitiatePaymentDto,
  ): Promise<any> {
    //const token = await this.getAccessToken();
    const authData =
      'G3cf/VTtAHCdHZNxc5GXWRI8z5P0goL2amXWDVFgb6D3XK/QMtZW90TYdl5zffDCNpiZThJzk0+eEU/Y/aYS6fyIOpQZGFrOr8hmvx5869sl2kr5u8qjnM7q5b4ZnTqdKDLtNxr3Qr7anj6YLpox1FOsiyT26mktXL+7SFOaZ15NMtne1z4xrj4R2SndowI/Znsapo7Gfzvp+L7XJyQ8kLYYRk3INjvmRPPQoJg1R0Nnh6EQE3ldIdwylB7GKtr6a71N/yCd4ZtyIcqq1ZNzdWcZyy5eEBAlDIxuECdBqH6hRq2/RbkfARqidNN4Kq0WviSRaRYGbiNjl2W9pNcM8g==';
    const token =
      'eyJhbGciOiJSUzI1NiJ9.eyJhdWQiOlsiaXN3LWNvbGxlY3Rpb25zIiwiaXN3LXBheW1lbnRnYXRld2F5IiwicGFzc3BvcnQiLCJwcm9qZWN0LXgtbWVyY2hhbnQiLCJ2YXVsdCJdLCJtZXJjaGFudF9jb2RlIjoiTVg2MDcyIiwicmVxdWVzdG9yX2lkIjoiMTIzODA4NTk1MDMiLCJzY29wZSI6WyJwcm9maWxlIl0sImp0aSI6IjVkOTczM2Y5LWMzNDEtNGFjZC04ZjE3LWViYzUyYWE0NjM2MiIsInBheWFibGVfaWQiOiIzMzU5NyIsImNsaWVudF9pZCI6IklLSUFCMjNBNEUyNzU2NjA1QzFBQkMzM0NFM0MyODdFMjcyNjdGNjYwRDYxIn0.ElgBX2KoF9LuUUpeBGzzp8CDAllTHWfgM6pJRgTtPYGJpoZufKlJrmE4QTvZV6MIVaNtK21majTgR4qXJr7CEkPK_4zCIHyN2b8a445vqhLYcbffQvK4EeUn_RzsWTmub2bruG5s4bRS1il5itPR0QQ-trEsbELU7TAHvC4p786RiAQd-K_I0bwtLzIXQN65jlw3eJxxK-BGfca-OMTUo9HGvraebfLB-7h4-vNbPred58gfLBSwK31jaLP19cMRc5Jea28jrlmGNUhHGzjnP7ZanqgC9uuvoepQsa39_DNBonR6xirxKw4aNlNLcKOTn026wyOTHIHUGlDQ3s3AOQ';
    //const purchasePayload = { ...initiatePaymentDto, authData: authData };
    const { customerId, amount, ...otherFields } = initiatePaymentDto; // Destructure necessary fields
    const purchasePayload = {
      ...otherFields,
      customerId, // Assign customerId to email
      authData,
      amount: String(amount), // Ensure amount is converted to a string
    };
    console.log(purchasePayload);
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
    const response = await axios.post<TokenResponse>(
      this.tokenUrl,
      'grant_type=client_credentials', // Body as a URL-encoded string
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.clientId}:${this.clientSecret}`,
          ).toString('base64')}`,
        },
      },
    );

    return response.data.access_token;
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
      Authorization:
        'Basic SUtJQUE4OTEwMEY1MUE4Njc4MUJEODM1RTkwQjBGOUMxREZBMDM2MzNBMEF0ZmtIcjdoRWM0dVY3Qmswa0hDRHhrRzdsc09BOXMvcnNOdHp2T2k0TjlVPTpNWDU4NTAy',
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
