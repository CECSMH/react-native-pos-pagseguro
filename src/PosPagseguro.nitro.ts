import type { HybridObject } from 'react-native-nitro-modules';

import type { CustomError } from './types/exceptions';
import type { CustomPrinterLayout, StyleData } from './types/styles';
import type { Capabilities, PlugPagMode, PlugPagOp, SubAcquirer, UserData } from './types/device';
import type { Installment, InstallmentTypes, PaymentData, PaymentEvent, TransactionResult, VoidPayData } from './types/payments';

export interface PosPagseguro extends HybridObject<{ android: 'kotlin' }> {
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
  hasSoftwareCapability(op: PlugPagOp, mode: PlugPagMode): boolean;
  initialize(activation_code: string): void;

  doPayment(payment_data: PaymentData, process_callback: (event: string, code: PaymentEvent) => void): Promise<TransactionResult | CustomError>;
  voidPayment(void_data: VoidPayData, process_callback: (event: string, code: PaymentEvent) => void): Promise<TransactionResult | CustomError>;

  getLastApprovedTransaction(): TransactionResult | CustomError;

  calculateInstallments(value: string, type: InstallmentTypes): Installment[];

  setStyleData(data: StyleData): boolean;
  setPrinterLayout(data: CustomPrinterLayout): void;
}
