import PagSeguro from './pag_seguro';
import { PaymentError, PrintError } from './types/exceptions';
import type { CustomPrinterLayout, StyleData } from './types/styles';
import type { PaymentData, TransactionResult, VoidPayData } from './types/payments';
import { InstallmentTypes, PaymentTypes, VoidType, PaymentEvent, HookPayState } from './types/payments';

import usePagPayment from './hooks/usePagPayment';
import usePagRefund from './hooks/usePagRefund';

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
  HookPayState,
  usePagRefund,
  PaymentError,
  usePagPayment,
  PaymentTypes,
  PaymentEvent,
  InstallmentTypes,
}