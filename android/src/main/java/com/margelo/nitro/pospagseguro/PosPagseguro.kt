package com.margelo.nitro.pospagseguro
  
import com.margelo.nitro.core.Promise
import com.margelo.nitro.NitroModules 

import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.bridge.ReactApplicationContext

import br.com.uol.pagseguro.plugpagservice.wrapper.IPlugPagWrapper
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagCommand
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagCustomPrinterLayout
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEffectuatePreAutoData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagExtras
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInitializationResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInstallment
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagNFCResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagNearFieldCardData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPaymentData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPreAutoData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPreAutoKeyingData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPreAutoQueryData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterListener
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagReceiptSMSData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagStyleData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagVoidData
import br.com.uol.pagseguro.plugpagservice.wrapper.TerminalCapabilities
import br.com.uol.pagseguro.plugpagservice.wrapper.data.result.PlugPagCmdExchangeResult
import br.com.uol.pagseguro.plugpagservice.wrapper.exception.PlugPagException
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagAPDUCmdExchangeListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagAbortListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagActivationListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagInstallmentsListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagIsActivatedListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagLastTransactionListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagNFCListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagPaymentListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagPrintActionListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagSetStylesListener

import android.content.Context

@DoNotStrip
class PosPagseguro : HybridPosPagseguroSpec() {
  
  private val androidContext: Context get() = NitroModules.applicationContext!!

  val plug_pag: IPlugPagWrapper by lazy { PlugPag(androidContext) }

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  override fun initialize(activation_code: String): Promise<Unit> {
    val promise = Promise<Unit>()
      Thread {
          try {
              val r = plug_pag.initializeAndActivatePinpad(PlugPagActivationData(activation_code))

              if (r.result == PlugPag.RET_OK) promise.resolve(Unit) 
              else promise.reject(Exception("Activation failed"))
          } catch (e: Exception) { promise.reject(e) }
      }.start()
    return promise
  }

  override fun doPayment(payment_data: PaymentData): Promise<Unit> {
        val promise = Promise<Unit>() 

        Thread {
            try {
                if (!plug_pag.isAuthenticated()) {
                   /*  sendPaymentResult(
                        success = false,
                        message = "POS não autenticado!",
                        finalized = true
                    ) */
                    promise.reject(Exception("POS não autenticado!"))
                    return@Thread
                }

                val type = when (payment_data.type) {
                    PaymentTypes.CREDIT -> PlugPag.TYPE_CREDITO
                    PaymentTypes.DEBIT -> PlugPag.TYPE_DEBITO
                    PaymentTypes.PIX_QR_CODE -> PlugPag.TYPE_PIX
                    PaymentTypes.VOUCHER -> PlugPag.TYPE_VOUCHER
                }

                val installmentType = when (payment_data.installment_type) {
                    InstallmentTypes.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
                    InstallmentTypes.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
                    InstallmentTypes.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
                }

                val ppPaymentData = PlugPagPaymentData(
                    type = type,
                    amount = payment_data.amount.toInt(), 
                    installmentType = installmentType,
                    installments = payment_data.installments.toInt(),
                    userReference = payment_data.user_reference?.toString() ?: "",
                    printReceipt = payment_data.print_receipt ?: true,
                    partialPay = false,
                    isCarne = false
                )

                val style = PlugPagCustomPrinterLayout(
                    title = "Imprimir via do cliente?",
                    titleColor = "#000000",
                    confirmTextColor = "#FFFFFF",
                    cancelTextColor = "#A0A0A0",
                    windowBackgroundColor = "#dfdfdf",
                    buttonBackgroundColor = "#0E4772",
                    buttonBackgroundColorDisabled = "#0E4772",
                    sendSMSTextColor = "#FFFFFF",
                    maxTimeShowPopup = 30
                )
                plug_pag.setPlugPagCustomPrinterLayout(style)

                plug_pag.setEventListener(object : PlugPagEventListener {
                    override fun onEvent(data: PlugPagEventData) {
                        val msg = when (data.eventCode) {
                            PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> "*"
                            PlugPagEventData.EVENT_CODE_NO_PASSWORD -> "Digite a senha"
                            else -> data.customMessage ?: "..."
                        }

                        val eventMap = mapOf("message" to msg)
                        //NitroModules.sendEvent("PagSeguroMessage", eventMap)
                    }
                })

                val payResult = plug_pag.doPayment(ppPaymentData)

                if (payResult.result == PlugPag.RET_OK) {
                    /* sendPaymentResult(
                        success = true,
                        message = payResult.message ?: "",
                        errorCode = payResult.errorCode ?: "",
                        transactionCode = payResult.transactionCode ?: "",
                        transactionId = payResult.transactionId ?: "",
                        date = payResult.date ?: "",
                        time = payResult.time ?: "",
                        cardBrand = payResult.cardBrand ?: "",
                        bin = payResult.bin ?: "",
                        holder = payResult.holder ?: "",
                        userReference = payResult.userReference ?: "",
                        terminalSerialNumber = payResult.terminalSerialNumber ?: "",
                        amount = payResult.amount ?: "",
                        availableBalance = payResult.availableBalance ?: "",
                        finalized = true
                    ) */
                    promise.resolve(Unit)
                } else {
                    plug_pag.abort()

                  /*   sendPaymentResult(
                        success = false,
                        message = payResult.message ?: "Erro no pagamento",
                        errorCode = payResult.errorCode ?: "",
                        resultDescription = "Erro no Pagamento!",
                        finalized = true
                    ) */
                    promise.reject(Exception(payResult.message ?: "Pagamento falhou"))
                }

            } catch (e: PlugPagException) {
               /*  sendPaymentResult(
                    success = false,
                    message = e.message ?: "Exceção PlugPag",
                    finalized = true
                ) */
                promise.reject(Exception(e.message ?: "Erro PlugPag"))
            } catch (e: Exception) {
               /*  sendPaymentResult(
                    success = false,
                    message = "Erro inesperado: ${e.message}",
                    finalized = true
                ) */
                promise.reject(Exception(e.message ?: "Erro desconhecido"))
            }
        }.start()

        return promise
    }

    private fun PlugPagTransactionResult.toMap(): Map<String, Any?> {
        val map = mapOf(
          "message" to message,
          "error_code" to errorCode,
          "transaction_code" to transactionCode,
          "transaction_id" to transactionId,
          "date" to date,
          "time" to time,
          "host_nsu" to hostNsu,
          "card_brand" to cardBrand,
          "bin" to bin,
          "holder" to holder,
          "user_reference" to userReference,
          "terminal_serial_number" to terminalSerialNumber,
          "amount" to amount,
          "available_balance" to availableBalance,
          "card_application" to cardApplication,
          "label" to label,
          "holder_name" to holderName,
          "extended_holder_name" to extendedHolderName,
          "card_issuer_nationality" to cardIssuerNationality?.name,
          "result" to result,
          "reader_model" to readerModel,
          "nsu" to nsu,
          "auto_code" to autoCode,
          "installments" to installments,
          "original_amount" to originalAmount,
          "buyer_name" to buyerName,
          "payment_type" to paymentType,
          "type_transaction" to typeTransaction,
          "app_identification" to appIdentification,
          "card_hash" to cardHash,
          "pre_auto_due_date" to preAutoDueDate,
          "pre_auto_original_amount" to preAutoOriginalAmount,
          "user_registered" to userRegistered,
          "accumulated_value" to accumulatedValue,
          "consumer_identification" to consumerIdentification,
          "current_balance" to currentBalance,
          "consumer_phone_number" to consumerPhoneNumber,
          "clube_pag_screens_ids" to clubePagScreensIds,
          "partial_pay_partially_authorized_amount" to partialPayPartiallyAuthorizedAmount,
          "partial_pay_remaining_amount" to partialPayRemainingAmount,
          "pix_tx_id_code" to pixTxIdCode
        )
        return map
    }
}
