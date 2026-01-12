import PagSeguro from './pag_seguro';
import { PaymentError, PrintError } from './types/exceptions';
import type { CustomPrinterLayout, StyleData } from './types/styles';
import type { PaymentData, TransactionResult, VoidPayData } from './types/payments';
import { InstallmentTypes, PaymentTypes, VoidType, PaymentEvent } from './types/payments';


export type {
  StyleData,
  PaymentData,
  VoidPayData,
  TransactionResult,
  CustomPrinterLayout
}

export {
  PagSeguro as default,
  VoidType,
  PrintError,
  PaymentError,
  PaymentTypes,
  PaymentEvent,
  InstallmentTypes,
}