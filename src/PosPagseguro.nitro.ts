import type { HybridObject } from 'react-native-nitro-modules';

import type { PaymentData, TransactionResult } from './types/payments';
import type { Capabilities, SubAcquirer, UserData } from './types/device';

export interface PosPagseguro extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /*   sum(a: number, b: number): number;
    divive(a: number, b: number): number;
    subtract(a: number, b: number): number; */
  multiply(a: number, b: number): number;

  getModel(): string;
  getSerialNumber(): string;
  getSubAcquirerData(): SubAcquirer | undefined;
  getUserData(): UserData;

  isServiceBusy(): boolean;
  isAuthenticated(): boolean;
  hasCapability(capability: Capabilities): boolean;
  initialize(activation_code: string): void;
  deactivate(activation_code: string): Promise<void>;
  doPayment(payment_data: PaymentData, cb: (test: string) => void): Promise<TransactionResult | undefined>;
}
