import PagSeguro from './pag_seguro';
import { InstallmentTypes, PaymentTypes } from './types/payments';
import type { PaymentData, TransactionResult } from './types/payments';

export type {
  PaymentData,
  TransactionResult
}
export {
  PagSeguro as default,
  PaymentTypes,
  InstallmentTypes,
}