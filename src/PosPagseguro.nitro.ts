import type { HybridObject } from 'react-native-nitro-modules';
import type { PaymentData } from './types/payments';

export interface PosPagseguro
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  multiply(a: number, b: number): number;
  initialize(activation_code: string): Promise<void>;
  doPayment(payment_data: PaymentData): Promise<void>;
}
