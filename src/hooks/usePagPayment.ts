import { useCallback, useMemo, useRef, useState } from "react";

import PagSeguro from "../pag_seguro";
import {
    HookPayState,
    PaymentEvent,
    type PaymentData,
    type TransactionResult
} from "../types/payments";

export default function usePagPayment() {
    const aborting = useRef(false);
    const [state, setState] = useState(HookPayState.IDLE);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<any>(null);


    const request_payment = useCallback(async (data: PaymentData): Promise<TransactionResult> => {
        try {
            aborting.current = false;
            setState(HookPayState.PROCESSING);
            setMessage("Processando...");

            const r = await PagSeguro.do_payment(data, (msg, code) => {
                switch (code) {
                    case PaymentEvent.WAITING_CARD:
                        setState(HookPayState.WAITING_CARD);
                        setMessage("Insira, passe ou aproxime o cartão");
                        break;
                    case PaymentEvent.INSERTED_CARD:
                        setState(HookPayState.CARD_INSERTED);
                        setMessage("Cartão identificado");
                        break;
                    case PaymentEvent.WAITING_REMOVE_CARD:
                        setState(HookPayState.WAITING_REMOVE_CARD);
                        setMessage("Remova o cartão");
                        break;
                    case PaymentEvent.SALE_END:
                        setState(HookPayState.SALE_END);
                        setMessage("Transação finalizada");
                        break;
                    case PaymentEvent.AUTHORIZING:
                        setState(HookPayState.AUTHORIZING);
                        setMessage("Autorizando...");
                        break;
                    case PaymentEvent.REMOVED_CARD:
                        setState(HookPayState.CARD_REMOVED);
                        setMessage("Cartão removido");
                        break;
                    case PaymentEvent.PIN_REQUESTED:
                        setState(HookPayState.ENTER_PASSWORD);
                        setMessage("Digite sua senha");
                        break;
                    case PaymentEvent.PIN_OK:
                        setState(HookPayState.PIN_OK);
                        setMessage("Senha confirmada");
                        break;
                    case PaymentEvent.APPROVED:
                        setState(HookPayState.APPROVED);
                        setMessage("Pagamento aprovado!");
                        break;
                    case PaymentEvent.NO_PASSWORD:
                        setState(HookPayState.ENTER_PASSWORD);
                        setMessage("Digite sua senha");
                        break;
                    case PaymentEvent.CVV_REQUESTED:
                        setState(HookPayState.ENTER_CVV);
                        setMessage("Digite o CVV do cartão");
                        break;
                    case PaymentEvent.CVV_OK:
                        setState(HookPayState.CVV_OK);
                        setMessage("CVV confirmado");
                        break;
                    case PaymentEvent.CAR_BIN_REQUESTED:
                        setState(HookPayState.ENTER_CAR_BIN);
                        setMessage("Digite o BIN do cartão");
                        break;
                    case PaymentEvent.CAR_BIN_OK:
                        setState(HookPayState.CAR_BIN_OK);
                        setMessage("BIN confirmado");
                        break;
                    case PaymentEvent.CAR_HOLDER_REQUESTED:
                        setState(HookPayState.ENTER_CAR_HOLDER);
                        setMessage("Digite o nome do portador");
                        break;
                    case PaymentEvent.CAR_HOLDER_OK:
                        setState(HookPayState.CAR_HOLDER_OK);
                        setMessage("Nome confirmado");
                        break;
                    case PaymentEvent.ACTIVATION_SUCCESS:
                        setState(HookPayState.ACTIVATION_SUCCESS);
                        setMessage("Ativação realizada com sucesso");
                        break;
                    case PaymentEvent.DIGIT_PASSWORD:
                        setState(HookPayState.DIGIT_PASSWORD);
                        setMessage("Digitando senha...");
                        break;
                    case PaymentEvent.CONTACTLESS_ERROR:
                        setState(HookPayState.CONTACTLESS_ERROR);
                        setMessage("Erro na leitura por aproximação");
                        break;
                    case PaymentEvent.CONTACTLESS_ON_DEVICE:
                        setState(HookPayState.CONTACTLESS_ON_DEVICE);
                        setMessage("Siga as instruções no dispositivo");
                        break;
                    case PaymentEvent.SUCCESS:
                        setState(HookPayState.SUCCESS);
                        setMessage("Transação concluída com sucesso!");
                        break;
                    /* case PaymentEvent.CUSTOM_MESSAGE:
                        // Usa mensagem customizada do terminal se disponível
                        if (msg) {
                            setMessage(msg);
                        }
                        break;
                    case PaymentEvent.DEFAULT:
                        // Mensagem genérica/fallback
                        if (msg) {
                            setMessage(msg);
                        }
                        break; */
                    case PaymentEvent.NOT_APPROVED:
                        setState(HookPayState.REPROVED);
                        setMessage("Pagamento reprovado!");
                        break;
                    case PaymentEvent.USE_CHIP:
                        setState(HookPayState.USE_CHIP);
                        setMessage("Insira o cartão com chip");
                        break;
                    case PaymentEvent.USE_TARJA:
                        setState(HookPayState.USE_TARJA);
                        setMessage("Use a tarja do cartão!");
                        break;
                    case PaymentEvent.SOLVE_PENDINGS:
                        setState(HookPayState.SOLVING_PENDINGS);
                        setMessage("Resolvendo pendências...");
                        break;
                    case PaymentEvent.DOWNLOADING_TABLES:
                        setState(HookPayState.DOWNLOADING_TABLES);
                        setMessage("Fazendo carga de tabelas...");
                        break;
                    case PaymentEvent.RECORDING_TABLES:
                        setState(HookPayState.RECORDING_TABLES);
                        setMessage("Gravando tabelas...");
                        break;
                    case PaymentEvent.ON_EVENT_ERROR:
                        setState(HookPayState.ERROR);
                        setMessage(msg || "Erro no evento");
                        break;
                }
            });

            setState(HookPayState.IDLE);
            setMessage("");
            aborting.current = false;
            return r;
        } catch (err) {
            aborting.current = false;
            setErrors(err);
            setState(HookPayState.ERROR);

            const error = err as Error & { code?: string; message?: string };
            setMessage(error.message || "Falha no pagamento");

            return Promise.reject(err);
        }
    }, []);

    const abort_operation = useCallback((): void => {
        if (aborting.current) return;
        aborting.current = true;
        PagSeguro.abort_current_operation();
    }, [aborting]);

    const reset = useCallback(() => {
        if (isProcessing) {
            console.warn("Não é possivel reinicializar o hook com uma operação em andamento, por favor cancele a operação antes!");
            return false;
        }

        setState(HookPayState.IDLE);
        setMessage("");
        setErrors(null);
        aborting.current = false;
        return true;
    }, []);

    const isProcessing = useMemo(() => [
        HookPayState.PROCESSING,
        HookPayState.WAITING_CARD,
        HookPayState.CARD_INSERTED,
        HookPayState.USE_CHIP,
        HookPayState.USE_TARJA,
        HookPayState.ENTER_PASSWORD,
        HookPayState.ENTER_CVV,
        HookPayState.ENTER_CAR_BIN,
        HookPayState.ENTER_CAR_HOLDER,
        HookPayState.PIN_OK,
        HookPayState.CVV_OK,
        HookPayState.CAR_BIN_OK,
        HookPayState.CAR_HOLDER_OK,
        HookPayState.DIGIT_PASSWORD,
        HookPayState.AUTHORIZING,
        HookPayState.WAITING_REMOVE_CARD,
        HookPayState.CONTACTLESS_ON_DEVICE,
        HookPayState.SOLVING_PENDINGS,
        HookPayState.DOWNLOADING_TABLES,
        HookPayState.RECORDING_TABLES
    ].includes(state), [state]);

    const isSuccess = useMemo(() => [
        HookPayState.APPROVED,
        HookPayState.SUCCESS,
        HookPayState.SALE_END,
        HookPayState.ACTIVATION_SUCCESS
    ].includes(state), [state]);

    const isError = useMemo(() =>
        state === HookPayState.ERROR ||
        state === HookPayState.REPROVED ||
        state === HookPayState.CONTACTLESS_ERROR,
        [state]
    );

    return {
        request_payment,
        abort_operation,
        reset,
        state,
        message,
        errors,
        isError,
        isSuccess,
        isProcessing
    };
}

