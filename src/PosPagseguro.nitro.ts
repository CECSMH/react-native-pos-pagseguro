import type { HybridObject } from 'react-native-nitro-modules';

import type { CustomError } from './types/exceptions';
import type { PaymentData, TransactionResult, VoidPayData } from './types/payments';
import type { Capabilities, SubAcquirer, UserData } from './types/device';

export interface PosPagseguro extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getModel(): string;
  getSerialNumber(): string;
  getSubAcquirerData(): SubAcquirer | undefined;
  getUserData(): UserData;

  reboot(): void;

  reprintCustomerReceipt(): Promise<number | CustomError>;
  reprintStablishmentReceipt(): Promise<number | CustomError>;

  printFromFile(file_path: string, quality: number, bottomPad?: number): Promise<number | CustomError>;
  printFromBase64(base_64: string, quality: number, bottomPad?: number): Promise<number | CustomError>;

  abort(): CustomError | undefined;

  isServiceBusy(): boolean;
  isAuthenticated(): boolean;
  hasCapability(capability: Capabilities): boolean;
  initialize(activation_code: string): void;

  doPayment(payment_data: PaymentData, process_callback: (event: string) => void): Promise<TransactionResult | CustomError>;
  voidPayment(void_data: VoidPayData, process_callback: (event: string) => void): Promise<TransactionResult | CustomError>;

  getLastApprovedTransaction(): TransactionResult | CustomError;
}
