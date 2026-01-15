package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.PlugPagOp
import com.margelo.nitro.pospagseguro.PlugPagMode
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagCommand


fun PlugPagOp.toCommand(): PlugPagCommand {
    return when (this) {
    PlugPagOp.ACTIVATE -> PlugPagCommand.OPERATION_ACTIVATE
    PlugPagOp.PAYMENT -> PlugPagCommand.OPERATION_PAYMENT
    PlugPagOp.REFUND -> PlugPagCommand.OPERATION_REFUND
    PlugPagOp.QUERYLASTAPPROVED -> PlugPagCommand.OPERATION_QUERY_LAST_APPROVED_TRANSACTION
    PlugPagOp.REPRINTCUSTOMER -> PlugPagCommand.OPERATION_REPRINT_CUSTOMER_RECEIPT
    PlugPagOp.REPRINTMERCHANT -> PlugPagCommand.OPERATION_REPRINT_ESTABLISHMENT_RECEIPT
    PlugPagOp.PRINT -> PlugPagCommand.OPERATION_PRINT
    PlugPagOp.CALCINSTALLMENTS -> PlugPagCommand.OPERATION_CALCULATE_INSTALLMENTS
    PlugPagOp.CALCINSTALLMENTSWITHTOTAL -> PlugPagCommand.OPERATION_CALCULATE_INSTALLMENTS_WITH_TOTAL_AMOUNT
    PlugPagOp.GETCARDDATA -> PlugPagCommand.OPERATION_GET_CARD_DATA
    PlugPagOp.INITTECHACTIVATION -> PlugPagCommand.OPERATION_INIT_TECH_ACTIVATION
    PlugPagOp.SENDLOGS -> PlugPagCommand.OPERATION_SEND_PS_LOGS           
    PlugPagOp.PREAUTHCREATE -> PlugPagCommand.OPERATION_PRE_AUTO_CREATE 
    PlugPagOp.PREAUTHCAPTURE -> PlugPagCommand.OPERATION_EFFECTUATE_PRE_AUTO
    PlugPagOp.PREAUTHCANCEL -> PlugPagCommand.OPERATION_PRE_AUTO_CANCEL
    PlugPagOp.NOEXTRAPARAMS -> PlugPagCommand.OPERATION_NO_EXTRA_PARAMS
    }
}


