package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.TransactionResult
import com.margelo.nitro.pospagseguro.CardIssuerNationality
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult

fun PlugPagTransactionResult.toTransactionResult(): TransactionResult {
    return TransactionResult(
        transaction_code = this.transactionCode,
        transaction_id = this.transactionId,
        date = this.date,
        time = this.time,
        host_nsu = this.hostNsu,
        card_brand = this.cardBrand,
        bin = this.bin,
        holder = this.holder,
        user_reference = this.userReference,
        terminal_serial_number = this.terminalSerialNumber,
        amount = this.amount,
        available_balance = this.availableBalance,
        card_application = this.cardApplication,
        label = this.label,
        holder_name = this.holderName,
        extended_holder_name = this.extendedHolderName,
        card_issuer_nationality = when(this.cardIssuerNationality){
            br.com.uol.pagseguro.plugpagservice.wrapper.CardIssuerNationality.UNAVAILABLE -> CardIssuerNationality.UNAVAILABLE
            br.com.uol.pagseguro.plugpagservice.wrapper.CardIssuerNationality.NATIONAL -> CardIssuerNationality.DOMESTIC
            br.com.uol.pagseguro.plugpagservice.wrapper.CardIssuerNationality.INTERNATIONAL -> CardIssuerNationality.INTERNATIONAL
            else -> CardIssuerNationality.UNAVAILABLE
        },
        reader_model = this.readerModel,
        nsu = this.nsu,
        auto_code = this.autoCode,
        installments = this.installments?.toDouble(),
        original_amount = this.originalAmount?.toDouble(),
        buyer_name = this.buyerName,
        payment_type = this.paymentType?.toDouble(),
        type_transaction = this.typeTransaction,
        app_identification = this.appIdentification,
        card_hash = this.cardHash,
        pre_auto_due_date = this.preAutoDueDate,
        pre_auto_original_amount = this.preAutoOriginalAmount,
        user_registered = this.userRegistered.toDouble(),
        accumulated_value = this.accumulatedValue,
        consumer_identification = this.consumerIdentification,
        current_balance = this.currentBalance,
        consumer_phone_number = this.consumerPhoneNumber,
        clube_pag_screens_ids = this.clubePagScreensIds,
        partial_pay_partially_authorized_amount = this.partialPayPartiallyAuthorizedAmount,
        partial_pay_remaining_amount = this.partialPayRemainingAmount,
        pix_tx_id_code = this.pixTxIdCode
    )
}