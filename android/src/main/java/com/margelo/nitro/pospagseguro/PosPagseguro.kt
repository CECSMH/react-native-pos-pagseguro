package com.margelo.nitro.pospagseguro
  
import com.margelo.nitro.core.Promise
import com.margelo.nitro.NitroModules 
import com.margelo.nitro.core.NullType
import com.margelo.nitro.pospagseguro.maps.*

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
import br.com.uol.pagseguro.plugpagservice.wrapper.data.result.PlugPagCmdExchangeResult
import br.com.uol.pagseguro.plugpagservice.wrapper.TerminalCapabilities
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
import android.util.Log
@DoNotStrip
class PosPagseguro : HybridPosPagseguroSpec() {
  
  private val androidContext: Context get() = NitroModules.applicationContext!!

  var plug_pag: IPlugPagWrapper =PlugPag(androidContext) 

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
init {
    Log.d("NitroModule", "PosPagseguro Hybrid Object created!")
}
  override fun getModel(): String { return plug_pag.getModel(); }
  override fun getSerialNumber(): String { return plug_pag.getSerialNumber(); }
  override fun getSubAcquirerData(): SubAcquirer? { return plug_pag.getSubAcquirerData()?.toSubAcquirer()}
  override fun getUserData(): UserData { return plug_pag.getUserData().toUserData() }

  override fun isAuthenticated(): Boolean {return plug_pag.isAuthenticated();}
  override fun isServiceBusy(): Boolean { return plug_pag.isServiceBusy(); };

  override fun hasCapability(capability: Capabilities): Boolean { return plug_pag.hasCapability(capability.value) }

  override fun initialize(activation_code: String): Unit {
 
          try {
              val r = plug_pag.initializeAndActivatePinpad(PlugPagActivationData(activation_code))

            /*   if (r.result == PlugPag.RET_OK) promise.resolve(Unit) 
              else promise.reject(Exception("Activation failed")) */
          } catch (e: Exception) { /* promise.reject(e) */ }
    
  }

  override fun deactivate(activation_code: String): Promise<Unit>{
    val promise = Promise<Unit>()
    promise.resolve(Unit);
    return promise;
  }

 override fun doPayment(payment_data: PaymentData, cb: (test: String) -> Unit): Promise<TransactionResult?> {
    Log.d("NitroModule", "Starting payment on background thread")
cb("teste 1")
        plug_pag = PlugPag(androidContext)
    return Promise.async {
            Log.d("NitroModule", "Starting payment on background thread")
cb("teste 2")

            try {
                if (!plug_pag.isAuthenticated()) {
                  /*   return@background TransactionResult(
                        success = false,
                        message = "POS não autenticado!",
                        finalized = true
                        // add other default fields if needed
                    ) */
                    cb("não autenticado")
                }

                val type = when (payment_data.type) {
                    PaymentTypes.CREDIT -> PlugPag.TYPE_CREDITO
                    PaymentTypes.DEBIT -> PlugPag.TYPE_DEBITO
                    PaymentTypes.PIX -> PlugPag.TYPE_PIX
                    PaymentTypes.VOUCHER -> PlugPag.TYPE_VOUCHER
                    else -> throw IllegalArgumentException("Tipo de pagamento inválido")
                }

                val installmentType = when (payment_data.installment_type) {
                    InstallmentTypes.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
                    InstallmentTypes.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
                    InstallmentTypes.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
                    else -> throw IllegalArgumentException("Tipo de parcelamento inválido")
                }

                val ppPaymentData = PlugPagPaymentData(
                    type = type,
                    amount = payment_data.amount.toInt(),
                    installmentType = installmentType,
                    installments = payment_data.installments.toInt(),
                    userReference = payment_data.user_reference?.toString() ?: "",  // ← Fixed here
                    printReceipt = payment_data.print_receipt ?: true,
                    partialPay = false,
                    isCarne = false
                )

                // ... rest of setup (style, event listener) remains the same ...

                plug_pag.setEventListener(object : PlugPagEventListener {
                    override fun onEvent(data: PlugPagEventData) {
                        val msg = when (data.eventCode) {
                            PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> "*"
                            PlugPagEventData.EVENT_CODE_NO_PASSWORD -> "Digite a senha"
                            else -> data.customMessage ?: "Aguardando..."
                        }
                        Log.d("NitroModule", "Payment event: $msg")
                        // NitroModules.sendEvent(...) if you want
                    }
                })

                val payResult = plug_pag.doPayment(paymentData = ppPaymentData)

                if (payResult.result == PlugPag.RET_OK) {
                    return@async payResult.toTransactionResult()
                } else {
                    plug_pag.abort()
                    cb("doadoaskdosaaokso")
                    cb(payResult.result.toString())
                    cb(payResult.errorCode ?: "erro nulo")
                    cb(payResult.message?: "erro no processamento")
                    /* return@background TransactionResult(
                        success = false,
                        message = payResult.message ?: "Erro no pagamento",
                        errorCode = payResult.errorCode ?: "",
                        finalized = true
                    ) */
                }

            } catch (e: PlugPagException) {
               /*  return@background TransactionResult(
                    success = false,
                    message = e.message ?: "Exceção PlugPag",
                    finalized = true
                ) */
                cb(e.message?: "error 1 block")
                cb("error 1 block")
            } catch (e: Exception) {
                Log.e("NitroModule", "Unexpected error during payment", e)
                /* return@background TransactionResult(
                    success = false,
                    message = "Erro inesperado: ${e.message}",
                    finalized = true
                ) */
                cb(e.message?: "error 2 block")
            }
            return@async null
        }
    }
}
