import { NitroModules } from "react-native-nitro-modules";

import type { PaymentData } from "./types/payments";
import type { PosPagseguro } from "./PosPagseguro.nitro";
import { Capabilities, type SubAcquirer, type UserData } from "./types/device";

const PosPagseguroHybridObject = NitroModules.createHybridObject<PosPagseguro>('PosPagseguro');

export function multiply(a: number, b: number): number {
    return PosPagseguroHybridObject.multiply(a, b);
}


export default class PagSeguro {
    static #activation_code: string;

    static async initialize(activation_code: string) {
        this.#activation_code = activation_code;
        await PosPagseguroHybridObject.initialize(activation_code);
    };

    static async deactivate() {
        await PosPagseguroHybridObject.deactivate(this.#activation_code);
    };

    static async do_payment(data: PaymentData) {
        return PosPagseguroHybridObject.doPayment(data, console.log)
    };

    /**
     * Verificar se há usuário autenticado.
     */
    static is_authenticated(): boolean {
        return PosPagseguroHybridObject.isAuthenticated();
    };

    /**
     * Verificar se o serviço está ocupado.
     */
    static is_busy(): boolean {
        return PosPagseguroHybridObject.isServiceBusy();
    };

    /**
     * Modelo do terminal.
     */
    static get_model(): string {
        return PosPagseguroHybridObject.getModel();
    };

    /**
     * Dados do usuário do terminal.
     */
    static get_userdata(): UserData {
        return PosPagseguroHybridObject.getUserData();
    };

    /**
     * Serial do terminal.
     */
    static get_serial_number(): string {
        return PosPagseguroHybridObject.getSerialNumber();
    };

    /**
     * Sub adquirência do terminal
     */
    static get_sub_acquirer_data(): SubAcquirer | undefined {
        return PosPagseguroHybridObject.getSubAcquirerData();
    };

    static readonly capabilities = {
        /** Módulo de bluetooth */
        has_bluetooth() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.BLUETOOTH);
        },

        /** Leitor de tarja magnética */
        has_mag() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.MAG);
        },

        /** Leitor de chip */
        has_icc() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.ICC);
        },

        /** Contactless (NFC) */
        has_picc() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.PICC);
        },

        /** Impressora */
        has_printer() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.PRINTER);
        },

        /** Rede Ethernet */
        has_ethernet() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.ETHERNET);
        },

        /** Modem */
        has_modem() {
            return PosPagseguroHybridObject.hasCapability(Capabilities.MODEM);
        }
    }
}