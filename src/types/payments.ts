/**
 * Tipos de pagamento disponíveis.
 */
enum PaymentTypes {
  /**
   * Pagamento realizado via cartão de crédito.
   */
  CREDIT = 1,
  /**
   * Pagamento realizado via cartão de débito.
   */
  DEBIT = 2,
  /**
   * Pagamento realizado via voucher (vale-refeição, vale-alimentação etc.).
   */
  VOUCHER = 3,
  /**
   * Pagamento realizado via PIX.
   */
  PIX = 5,
}

/**
 * Tipos de parcelamento disponíveis.
 */
enum InstallmentTypes {
  /**
   * Pagamento sem parcelamento (à vista).
   */
  NO_INSTALLMENT = 1,
  /**
   * Parcelamento realizado pelo lojista.
   */
  SELLER_INSTALLMENT = 2,
  /**
   * Parcelamento realizado pelo comprador (administradora).
   */
  BUYER_INSTALLMENT = 3,
}

/**
 * Tipo de operação de cancelamento/estorno.
 */
enum VoidType {
  /**
   * Cancelamento de um pagamento já efetuado.
   */
  PAYMENT = 1,
  /**
   * Cancelamento de um QR Code PIX gerado (antes da leitura/captura).
   */
  QRCODE = 2
}

export type PaymentData = {
  /**
   * Valor em centavos.
   * Exemplo: 1000 representa R$10,00.
   */
  amount: number,
  /**
   * Tipo de parcelamento utilizado.
   * Define se o pagamento será à vista, parcelado pelo lojista ou pela administradora.
   */
  installment_type: InstallmentTypes,
  /**
   * Número de parcelas.
   * Exemplo: 3 significa que o pagamento será dividido em 3 vezes.
   */
  installments: number,
  /**
   * Indica se o comprovante deve ser impresso.
   * Valor padrão: false.
   */
  print_receipt?: boolean,
  /**
   * Tipo de pagamento.
   * Exemplo: crédito, débito, PIX, voucher etc.
   */
  type: PaymentTypes,
  /**
   * Referência opcional do usuário ou da transação.
   * Pode ser usada para vincular o pagamento a um pedido ou cliente específico.
   */
  user_reference?: string | number,
}

/**
 * Dados necessários para realizar um cancelamento/estorno.
 */
export type VoidPayData = {
  /**
   * Código da transação retornado pela adquirente/operadora.
   */
  transaction_code: string,
  /**
   * Identificador interno da transação no sistema.
   */
  transaction_id: string,
  /**
   * Indica se o comprovante de cancelamento deve ser impresso.
   * Valor padrão: false (dependendo da implementação).
   */
  print_receipt?: boolean,
  /**
   * Tipo de operação que está sendo cancelada.
   */
  void_type?: VoidType
}

/**
 * Nacionalidade da bandeira/emissor do cartão.
 */
export enum CardIssuerNationality {
  /**
   * Informação não disponível ou não aplicável.
   */
  UNAVAILABLE = "UNAVAILABLE",
  /**
   * Cartão emitido por instituição nacional (ex.: bandeiras brasileiras).
   */
  DOMESTIC = "DOMESTIC",
  /**
   * Cartão emitido por instituição internacional.
   */
  INTERNATIONAL = "INTERNATIONAL"
}

/**
 * Resultado detalhado de uma transação de pagamento.
 */
export type TransactionResult = {
  /** Código da transação retornado pela adquirente. */
  transaction_code?: string;
  /** Identificador interno da transação. */
  transaction_id?: string;
  /** Data da transação. */
  date?: string;
  /** Hora da transação. */
  time?: string;
  /** NSU da hospedagem (host NSU). */
  host_nsu?: string;
  /** Bandeira do cartão (ex.: Visa, Mastercard). */
  card_brand?: string;
  /** BIN (primeiros 6-8 dígitos) do cartão. */
  bin?: string;
  /** Nome impresso no cartão. */
  holder?: string;
  /** Referência informada pelo usuário/lojista. */
  user_reference?: string;
  /** Número de série do terminal/PIN pad utilizado. */
  terminal_serial_number?: string;
  /** Valor da transação formatado como string (em reais ou centavos, depende da implementação). */
  amount?: string;
  /** Saldo disponível após a transação (para cartões pré-pagos/voucher). */
  available_balance?: string;
  /** Aplicação do cartão (ex.: crédito, débito). */
  card_application?: string;
  /** Rótulo ou descrição da bandeira. */
  label?: string;
  /** Nome do portador do cartão (normalizado). */
  holder_name?: string;
  /** Nome extendido do portador (caso disponível). */
  extended_holder_name?: string;
  /** Nacionalidade do emissor da bandeira. */
  card_issuer_nationality?: CardIssuerNationality;
  /** Modelo do leitor de cartão utilizado. */
  reader_model?: string;
  /** NSU da transação. */
  nsu?: string;
  /** Código de autorização. */
  auto_code?: string;
  /** Quantidade de parcelas da transação. */
  installments?: number;
  /** Valor original da transação (antes de descontos ou ajustes). */
  original_amount?: number;
  /** Nome do comprador (quando informado). */
  buyer_name?: string;
  /** Tipo numérico do pagamento (compatibilidade com enums antigos). */
  payment_type?: number;
  /** Descrição do tipo de transação (ex.: "CREDITO", "DEBITO"). */
  type_transaction?: string;
  /** Identificação da aplicação no terminal. */
  app_identification?: string;
  /** Hash do cartão (tokenização). */
  card_hash?: string;
  /** Data de vencimento da pré-autorização. */
  pre_auto_due_date?: string;
  /** Valor original da pré-autorização. */
  pre_auto_original_amount?: string;
  /** Indicador se o usuário estava cadastrado. */
  user_registered?: number;
  /** Valor acumulado (para programas de fidelidade ou carteiras). */
  accumulated_value?: string;
  /** Identificação do consumidor. */
  consumer_identification?: string;
  /** Saldo atual (após transação). */
  current_balance?: string;
  /** Número de telefone do consumidor. */
  consumer_phone_number?: string;
  /** IDs de telas do Clube Pag (específico de alguns produtos). */
  clube_pag_screens_ids?: string;
  /** Valor parcialmente autorizado em pagamento parcial. */
  partial_pay_partially_authorized_amount?: string;
  /** Valor restante em pagamento parcial. */
  partial_pay_remaining_amount?: string;
  /** TxId do PIX (identificador da transação PIX). */
  pix_tx_id_code?: string;
}

/**
 * Eventos de pagamento
 */
export enum PaymentEvent {
  /**
   * Aguardando inserção do cartão.
   */
  WAITING_CARD = 0,
  /**
   * Cartão foi inserido no terminal.
   */
  INSERTED_CARD = 1,
  /**
   * Fim da transação (independente do resultado).
   */
  SALE_END = 4,
  /**
   * Aguardando autorização da senha.
   */
  AUTHORIZING = 5,
  /**
   * Aguardando remoção do cartão.
   */
  WAITING_REMOVE_CARD = 7,
  /**
   * Cartão foi removido do terminal.
   */
  REMOVED_CARD = 8,
  /**
   * Solicitação de digitação do PIN (senha).
   */
  PIN_REQUESTED = 2,
  /**
   * PIN (senha) digitado corretamente.
   */
  PIN_OK = 3,
  /**
   * Solicitação de CVV.
   */
  CVV_REQUESTED = 9,
  /**
   * CVV digitado corretamente.
   */
  CVV_OK = 10,
  /**
   * Solicitação de BIN do cartão.
   */
  CAR_BIN_REQUESTED = 11,
  /**
   * BIN do cartão digitado corretamente.
   */
  CAR_BIN_OK = 12,
  /**
   * Solicitação do nome do portador do cartão.
   */
  CAR_HOLDER_REQUESTED = 13,
  /**
   * Nome do portador do cartão digitado corretamente.
   */
  CAR_HOLDER_OK = 14,
  /**
   * Ativação realizada com sucesso.
   */
  ACTIVATION_SUCCESS = 15,
  /**
   * Dígito da senha foi digitado.
   */
  DIGIT_PASSWORD = 16,
  /**
   * Dígito da senha foi apagado.
   */
  NO_PASSWORD = 17,
  /**
   * Aprovada (cartão ou Pix).
   */
  APPROVED = 18,
  /**
   * Não aprovada (cartão ou Pix).
   */
  NOT_APPROVED = 19,
  /**
   * Erro de leitura em transação NFC.
   */
  CONTACTLESS_ERROR = 23,
  /**
   * Instruções exibidas no smartphone durante NFC.
   */
  CONTACTLESS_ON_DEVICE = 24,
  /**
   * Necessário usar tarja magnética.
   */
  USE_TARJA = 25,
  /**
   * Necessário usar chip.
   */
  USE_CHIP = 26,
  /**
   * Download de tabelas em andamento.
   */
  DOWNLOADING_TABLES = 27,
  /**
   * Gravação de tabelas em andamento.
   */
  RECORDING_TABLES = 28,
  /**
   * Transação concluída com sucesso.
   */
  SUCCESS = 29,
  /**
   * Resolvendo pendências de transações.
   */
  SOLVE_PENDINGS = 30,
  /**
   * Mensagem customizada enviada pelo terminal.
   */
  CUSTOM_MESSAGE = -1,
  /**
   * Evento padrão (fallback).
   */
  DEFAULT = -2,
  /**
   * Erro durante execução do evento.
   */
  ON_EVENT_ERROR = -3
}

export {
  VoidType,
  PaymentTypes,
  InstallmentTypes
}