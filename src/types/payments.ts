enum PaymentTypes {
  CREDIT = 1,
  DEBIT = 2,
  VOUCHER = 3,
  PIX = 5,
}

enum InstallmentTypes {
  NO_INSTALLMENT = 1,
  SELLER_INSTALLMENT = 2,
  BUYER_INSTALLMENT = 3,
}

export type PaymentData = {
  amount: number,
  installment_type: InstallmentTypes,
  installments: number,
  print_receipt?: boolean,
  type: PaymentTypes,
  user_reference?: number,
}

export enum CardIssuerNationality {
  UNAVAILABLE = "UNAVAILABLE",
  DOMESTIC = "DOMESTIC",
  INTERNATIONAL = "INTERNATIONAL"
}


export type TransactionResult = {
  message?: string;
  error_code?: string;
  transaction_code?: string;
  transaction_id?: string;
  date?: string;
  time?: string;
  host_nsu?: string;
  card_brand?: string;
  bin?: string;
  holder?: string;
  user_reference?: string;
  terminal_serial_number?: string;
  amount?: string;
  available_balance?: string;
  card_application?: string;
  label?: string;
  holder_name?: string;
  extended_holder_name?: string;
  card_issuer_nationality?: CardIssuerNationality;
  result?: number;
  reader_model?: string;
  nsu?: string;
  auto_code?: string;
  installments?: number;
  original_amount?: number;
  buyer_name?: string;
  payment_type?: number;
  type_transaction?: string;
  app_identification?: string;
  card_hash?: string;
  pre_auto_due_date?: string;
  pre_auto_original_amount?: string;
  user_registered?: number;
  accumulated_value?: string;
  consumer_identification?: string;
  current_balance?: string;
  consumer_phone_number?: string;
  clube_pag_screens_ids?: string;
  partial_pay_partially_authorized_amount?: string;
  partial_pay_remaining_amount?: string;
  pix_tx_id_code?: string;
}

export {
  PaymentTypes,
  InstallmentTypes
}