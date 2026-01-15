import { useMemo } from "react";

import { HookPayState } from "../types/payments";

export default function useBoolStates(state: HookPayState) {
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

    return { isProcessing, isSuccess, isError };
};