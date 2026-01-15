
export type SubAcquirer = {
    name: string;
    address: string;
    city: string;
    uf: string;
    country: string;
    zip_code: string;
    mcc: string;
    cnpj_cpf: string;
    doc_type: string;
    telephone: string;
    full_name: string;
    merchant_id: string;
}

export type UserData = {
    address?: string;
    city?: string;
    cnpj_cpf?: string;
    address_complement?: string;
    company_name?: string;
    nick_name?: string;
    address_state?: string;
    email?: string;
}

export enum PlugPagOp {
    ACTIVATE = 1001,
    PAYMENT = 1002,
    REFUND = 1003,
    QUERYLASTAPPROVED = 1004,
    REPRINTCUSTOMER = 1005,
    REPRINTMERCHANT = 1006,
    PRINT = 1007,
    CALCINSTALLMENTS = 1008,
    CALCINSTALLMENTSWITHTOTAL = 1009,
    GETCARDDATA = 1010,
    INITTECHACTIVATION = 1011,
    SENDLOGS = 1012,

    PREAUTHCREATE = 1101,
    PREAUTHCAPTURE = 1102,
    PREAUTHCANCEL = 1103,

    NOEXTRAPARAMS = 9999,
}

export enum PlugPagMode {
    REMOTECONFIG = 2001,
    DEFAULT = 0,
}

enum Capabilities {
    /**
     * Módulo de leitor de tarja magnética.
     */
    MAG = 1,
    /**
     * Módulo de leitor de chip.
     */
    ICC = 2,
    /**
     * Módulo de leitura por aproximação (Contactless).
     */
    PICC = 3,
    /**
     * Módulo de teclado seguro.
     */
    PED = 4,
    /**
     * Módulo de teclado externo.
    */
    KEYBOARD = 5,
    /**
     * Módulo de impressora.
     */
    PRINTER = 6,
    /**
     * Módulo de bluetooth.
     */
    BLUETOOTH = 7,
    /**
     * Módulo de caixa registradora.
     */
    CASH_BOX = 8,
    /**
     * Módulo de tela auxiliar.
     */
    CUSTOMER_DISPLAY = 9,
    /**
     * Módulo de rede.
     */
    ETHERNET = 10,
    /**
     * Módulo de leitor de digital.
     */
    FINGERPRINT_READER = 11,
    /**
     * Módulo de acelerômetro.
     */
    G_SENSOR = 12,
    /**
     * Módulo de saída HDMI.
     */
    HDMI = 13,
    /**
     * Módulo de leitor de cartões.
     */
    ID_CARD_READER = 14,
    /**
     * Módulo de SM.
     */
    SM = 15,
    /**
     * Módulo de modem.
     */
    MODEM = 16
}


export { Capabilities }