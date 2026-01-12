import { NitroModules } from "react-native-nitro-modules";

import type { PosPagseguro } from "./PosPagseguro.nitro";
import { InstallmentTypes, PaymentEvent, PaymentTypes, VoidType, type PaymentData, type TransactionResult, type VoidPayData } from "./types/payments";

import { AbordError, PaymentError, PrintError } from "./types/exceptions";
import { Capabilities, type SubAcquirer, type UserData } from "./types/device";
import type { CustomPrinterLayout, StyleData } from "./types/styles";

const PosPagseguroHybridObject = NitroModules.createHybridObject<PosPagseguro>('PosPagseguro');

/**
 * PagSeguro POS SDK para React Native
 *
 * Biblioteca de alto desempenho para integração com terminais PagSeguro (Moderninha, Moderninha2, etc.)
 *
 * ### Funcionalidades principais
 * - Inicialização e ativação do terminal
 * - Pagamentos: Crédito, Débito, Voucher e PIX
 * - Parcelamento (à vista, lojista sem juros, comprador com juros)
 * - Cancelamento/estorno de transações
 * - Consulta da última transação aprovada
 * - Reimpressão de vias (cliente e estabelecimento)
 * - Impressão personalizada (arquivo ou Base64)
 * - Aborto de operações em andamento
 * - Reinício do terminal
 * - Consulta de informações do dispositivo e estabelecimento
 * - Verificação de recursos (impressora, NFC, chip, tarja, etc.)
 *
 * ### Tratamento de erros
 * A maioria dos métodos assíncronos lança exceções específicas:
 * - {@link PaymentError} → Erros de pagamento, validação ou comunicação
 * - {@link PrintError}   → Falhas na impressão ou reimpressão
 * - {@link AbordError}  → Erro ao tentar abortar operação
 *
 * ### Exemplo básico de uso
 * ```ts
 * await PagSeguro.initialize("SEU_CODIGO");
 *
 * const resultado = await PagSeguro.do_payment({
 *   amount: 1000, // R$ 10.00
 *   type: PaymentTypes.CREDIT,
 *   installment_type: InstallmentTypes.SELLER_INSTALLMENT,
 *   installments: 3,
 *   print_receipt: true
 * });
 *
 * console.log("NSU:", resultado.transaction_code);
 * ```
 *
 * @module PagSeguro
 */
export default class PagSeguro {
    /**
     * Inicializa o terminal PagSeguro com o código de ativação fornecido.
     *
     * Deve ser chamado antes de qualquer outra operação.
     * Após a inicialização bem-sucedida, o terminal fica autenticado e pronto para pagamentos.
     *
     * @param activation_code Código de ativação do terminal (fornecido pelo PagSeguro)
     * @throws PaymentError Caso o código seja inválido ou ocorra falha na comunicação
     *
     * @example
     * await PagSeguro.initialize("ABC123456");
     */
    static initialize(activation_code: string): void {
        PosPagseguroHybridObject.initialize(activation_code);
    };

    /**
     * Reinicia o terminal PagSeguro.
     */
    static reboot() { PosPagseguroHybridObject.reboot() }

    /**
     * Realiza um pagamento no terminal PagSeguro.
     *
     * Suporta todos os tipos de pagamento disponíveis (crédito, débito, voucher, PIX)
     * e diferentes modalidades de parcelamento.
     *
     * @param data Dados do pagamento
     * @param process_callback Callback opcional chamado com mensagens de progresso (ex: "APROXIME, INSIRA OU PASSE O CARTÃO")
     * @returns Resultado completo da transação aprovada
     * @throws PaymentError Em caso de erro de validação, rejeição ou falha na comunicação
     *
     * @example
     * const tx = await PagSeguro.do_payment({
     *   amount: 2500, // R$ 25.00
     *   type: PaymentTypes.PIX,
     *   installment_type: InstallmentTypes.NO_INSTALLMENT,
     *   installments: 1,
     *   print_receipt: true
     * });
     */
    static async do_payment(data: PaymentData, process_callback: (message: string, code: PaymentEvent) => void = () => { }): Promise<TransactionResult> {
        validate_payment_data(data);
        const r = await PosPagseguroHybridObject.doPayment(data, process_callback);
        if ("message" in r && "code" in r) throw new PaymentError(r.code, r.message);
        return r;
    };

    /**
     * Realiza o cancelamento ou estorno de uma transação previamente aprovada.
     *
     * Funciona apenas para transações realizadas no mesmo dia (regra PagSeguro).
     * Para cancelamentos administrativos de dias anteriores, usar o portal.
     *
     * @param data Dados necessários para identificar a transação a ser cancelada
     * @param process_callback Callback opcional com mensagens de progresso
     * @returns Resultado da operação de cancelamento
     * @throws PaymentError Em caso de erro de validação ou rejeição
     */
    static async void_payment(data: VoidPayData, process_callback: (message: string, code: PaymentEvent) => void = () => { }): Promise<TransactionResult> {
        validate_void_pay_data(data);
        const r = await PosPagseguroHybridObject.voidPayment(data, process_callback);
        if ("message" in r && "code" in r) throw new PaymentError(r.code, r.message);
        return r;
    }

    /**
     * Aborta imediatamente qualquer operação em andamento no terminal
     *
     * @throws AbordError Caso o aborto não seja possível ou falhe
     */
    static abort_current_operation(): void {
        const r = PosPagseguroHybridObject.abort();
        if (r == undefined) return;
        if ("message" in r && "code" in r) throw new AbordError(r.code, r.message);
    }

    /**
     * Obtém os dados da última transação aprovada realizada no terminal.
     *
     * @returns Dados completos da transação (valor, NSU, bandeira, etc.)
     * @throws PaymentError Se não houver transação aprovada ou em caso de erro
     */
    static get_last_approved_transaction(): TransactionResult {
        const r = PosPagseguroHybridObject.getLastApprovedTransaction();
        if ("message" in r && "code" in r) throw new PaymentError(r.code, r.message);
        return r;
    };

    /**
     * Define o estilo visual (cores, botões, textos) das janelas modais
     * exibidas pelo terminal durante operações de pagamento.
     *
     * @param styles Objeto StyleData contendo as cores e estilos desejados
     */
    static set_modal_styles(styles: StyleData): boolean {
        return PosPagseguroHybridObject.setStyleData(styles);
    };

    /**
     * Define o layout e estilo visual da janela de impressão customizada
     * utilizada pelo terminal
     *
     * @param styles Objeto CustomPrinterLayout com título, cores e tempo máximo de exibição
     */
    static set_printer_modal_styles(styles: CustomPrinterLayout): void {
        PosPagseguroHybridObject.setPrinterLayout(styles);
    };

    /**
     * Reimprime a via do cliente da última transação aprovada.
     *
     * @returns Linhas impressas
     * @throws PrintError Em caso de falha na impressora
     */
    static async reprint_customer_receipt(): Promise<number> {
        const r = await PosPagseguroHybridObject.reprintCustomerReceipt();
        if (typeof r === "number") return r;
        throw new PrintError(r.code, r.message);
    }

    /**
     * Reimprime a via do estabelecimento da última transação aprovada.
     *
     * @returns Linhas impressas
     * @throws PrintError Em caso de falha
     */
    static async reprint_stablishment_receipt(): Promise<number> {
        const r = await PosPagseguroHybridObject.reprintStablishmentReceipt();
        if (typeof r === "number") return r;
        throw new PrintError(r.code, r.message);
    }

    /**
     * Verifica se há usuário autenticado.
     */
    static is_authenticated(): boolean {
        return PosPagseguroHybridObject.isAuthenticated();
    };

    /**
     * Verifica se o terminal está executando alguma operação no momento.
     */
    static is_busy(): boolean {
        return PosPagseguroHybridObject.isServiceBusy();
    };

    /**
     * Retorna o modelo do terminal PagSeguro.
     */
    static get_model(): string {
        return PosPagseguroHybridObject.getModel();
    };

    /**
     * Retorna os dados do usuário logado no terminal (vendedor).
     */
    static get_userdata(): UserData {
        return PosPagseguroHybridObject.getUserData();
    };

    /**
     * Retorna o número de série do terminal.
     */
    static get_serial_number(): string {
        return PosPagseguroHybridObject.getSerialNumber();
    };

    /**
     * Retorna os dados do estabelecimento cadastrado no terminal (subadquirente).
     */
    static get_sub_acquirer_data(): SubAcquirer | undefined {
        return PosPagseguroHybridObject.getSubAcquirerData();
    };

    /**
     * Imprime um arquivo de imagem armazenado no dispositivo.
     *
     * @param path Caminho completo do arquivo no filesystem
     * @param quality Qualidade da impressão. Padrão: 1
     * @param bottomPad Número de linhas em branco ao final. Padrão: 70
     * @returns Linhas impressas
     * @throws PrintError Em caso de falha
     */
    static async print_from_filepath(path: string, quality: number = 1, bottomPad = 70): Promise<number> {
        const r = await PosPagseguroHybridObject.printFromFile(path, quality, bottomPad);
        if (typeof r === "number") return r;
        throw new PrintError(r.code, r.message);
    };

    /**
     * Imprime uma imagem a partir de uma string Base64.
     * @param base64str String no formato Base64 (sem prefixo data:image/...)
     * @param quality Qualidade da impressão. Padrão: 1
     * @param bottomPad Linhas em branco ao final. Padrão: 70
     * @returns Linhas impressas
     * @throws PrintError Em caso de falha
     */
    static async print_from_base64(base64str: string, quality: number = 1, bottomPad = 70): Promise<number> {
        const r = await PosPagseguroHybridObject.printFromBase64(base64str, quality, bottomPad);
        if (typeof r === "number") return r;
        throw new PrintError(r.code, r.message);
    };

    /**
     * Verificação de recursos disponíveis no terminal.
     *
     * Permite adaptar a UI conforme os módulos presentes.
     */
    static readonly capabilities = {
        /** Verifica presença de módulo Bluetooth */
        has_bluetooth() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.BLUETOOTH);
        },

        /** Verifica leitor de tarja magnética */
        has_mag() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.MAG);
        },

        /** Verifica leitor de chip (EMV) */
        has_icc() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.ICC);
        },

        /** Verifica suporte a Contactless/NFC */
        has_picc() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.PICC);
        },

        /** Verifica presença de impressora térmica */
        has_printer() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.PRINTER);
        },

        /** Verifica conexão Ethernet */
        has_ethernet() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.ETHERNET);
        },

        /** Verifica modem 3G/4G */
        has_modem() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.MODEM);
        }
    }
}

function validate_payment_data(data: PaymentData): void {
    if (data.amount <= 0) throw new PaymentError("INVALID_ARG", "O valor deve ser maior que zero.");
    if (data.installments < 1) throw new PaymentError("INVALID_ARG", "O número de parcelas deve ser pelo menos 1.");
    if (!Object.values(PaymentTypes).includes(data.type)) throw new PaymentError("INVALID_ARG", "O tipo de pagamento informado não é válido.");
    if (!Object.values(InstallmentTypes).includes(data.installment_type)) throw new PaymentError("INVALID_ARG", `O tipo de parcelamento informado não é válido.`);
    if (data.user_reference !== undefined) {
        const ref = String(data.user_reference);
        const regex = /^[a-zA-Z0-9]+$/;
        if (!regex.test(ref)) throw new PaymentError("INVALID_ARG", "A referência do usuário deve conter apenas letras e/ou números.");
    };
};

function validate_void_pay_data(data: VoidPayData): void {
    if (!data.transaction_code || typeof data.transaction_code !== 'string' || data.transaction_code.trim() === '') {
        throw new PaymentError("INVALID_ARG", "O transaction_code é obrigatório e deve ser uma string não vazia.");
    }
    if (!data.transaction_id || typeof data.transaction_id !== 'string' || data.transaction_id.trim() === '') {
        throw new PaymentError("INVALID_ARG", "O transaction_id é obrigatório e deve ser uma string não vazia.");
    }
    if (data.print_receipt !== undefined && typeof data.print_receipt !== 'boolean') {
        throw new PaymentError("INVALID_ARG", "O print_receipt deve ser do tipo boolean.");
    }
    if (data.void_type !== undefined && !Object.values(VoidType).includes(data.void_type)) {
        throw new PaymentError("INVALID_ARG", "O void_type informado não é válido.");
    }
}