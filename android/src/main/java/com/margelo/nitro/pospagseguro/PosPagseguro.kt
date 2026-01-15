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
import br.com.uol.pagseguro.plugpagservice.wrapper.TerminalCapabilities
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagVoidData
import br.com.uol.pagseguro.plugpagservice.wrapper.data.result.PlugPagCmdExchangeResult
import br.com.uol.pagseguro.plugpagservice.wrapper.exception.PlugPagException
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagNFCListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagAbortListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagPaymentListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagSetStylesListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagActivationListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagPrintActionListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagIsActivatedListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagInstallmentsListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagAPDUCmdExchangeListener
import br.com.uol.pagseguro.plugpagservice.wrapper.listeners.PlugPagLastTransactionListener

import android.content.Context
import android.util.Log
import android.util.Base64
import java.io.File
import java.io.FileOutputStream

@DoNotStrip
class PosPagseguro : HybridPosPagseguroSpec() {
  
  private val androidContext: Context get() = NitroModules.applicationContext!!

  private val plug_pag: IPlugPagWrapper by lazy { PlugPag(androidContext) }

  override fun getModel(): String { return plug_pag.getModel(); }
  override fun getSerialNumber(): String { return plug_pag.getSerialNumber(); }
  override fun getSubAcquirerData(): SubAcquirer? { return plug_pag.getSubAcquirerData()?.toSubAcquirer()}
  override fun getUserData(): UserData { return plug_pag.getUserData().toUserData() }

  override fun isAuthenticated(): Boolean { return plug_pag.isAuthenticated(); }
  override fun isServiceBusy(): Boolean { return plug_pag.isServiceBusy(); };

  override fun reboot(): Unit { plug_pag.reboot(); }

  override fun setStyleData(data: StyleData): Boolean { return plug_pag.setStyleData(data.toPlugPagStyleData()) }
  override fun setPrinterLayout(data: CustomPrinterLayout): Unit { plug_pag.setPlugPagCustomPrinterLayout(data.toPlugPagCustomPrinterLayout()) }

  override fun reprintCustomerReceipt(): Promise<Variant_Double_CustomError> {
    return Promise.async {
        val r = plug_pag.reprintCustomerReceipt();
        if(r.result == PlugPag.RET_OK) return@async Variant_Double_CustomError.create(r.steps.toDouble());
        else return@async Variant_Double_CustomError.create(CustomError(r.errorCode ?: "PRINTERR", r.message ?: "Ocorreu um erro ao tentar reimprimir via do cliente"));
    }
  }

  override fun reprintStablishmentReceipt(): Promise<Variant_Double_CustomError> {
    return Promise.async {
        val r = plug_pag.reprintStablishmentReceipt();
        if(r.result == PlugPag.RET_OK) return@async Variant_Double_CustomError.create(r.steps.toDouble());
        else return@async Variant_Double_CustomError.create(CustomError(r.errorCode ?: "PRINTERR", r.message ?: "Ocorreu um erro ao tentar reimprimir via do estabelecimento"));
    }
  }

  override fun printFromBase64(base_64: String, quality: Double, bottomPad: Double?): Promise<Variant_Double_CustomError> {
    val bytes = Base64.decode(base_64, Base64.DEFAULT)

    val cached_file = File(androidContext.cacheDir, "temp_file")

    FileOutputStream(cached_file).use { fos ->
        fos.write(bytes)
        fos.flush()
    }

    return printFromFile(cached_file.absolutePath, quality, bottomPad);
  }

  override fun printFromFile(file_path: String, quality: Double, bottomPad: Double?): Promise<Variant_Double_CustomError> {
    return Promise.async{
        val q = quality.toInt();
        val bp = bottomPad?.toInt() ?: PlugPag.MIN_PRINTER_STEPS

        val r = plug_pag.printFromFile(PlugPagPrinterData(file_path, q, bp))
        if(r.result == PlugPag.RET_OK) return@async Variant_Double_CustomError.create(r.steps.toDouble());
        else return@async Variant_Double_CustomError.create(CustomError(r.errorCode ?: "PRINTERR", r.message ?: "Ocorreu um erro ao tentar imprimir arquivo"));
    }
  }

  override fun hasCapability(capability: Capabilities): Boolean { return plug_pag.hasCapability(capability.value) }
  override fun hasSoftwareCapability(op: PlugPagOp, mode: PlugPagMode): Boolean { 
    return when (mode){
       PlugPagMode.REMOTECONFIG -> plug_pag.hasSoftwareCapability(op.toCommand().command,  PlugPagCommand.OPERATION_MODE_REMOTECFG.command) 
       else ->  plug_pag.hasSoftwareCapability(op.toCommand().command) 
    }
  }

  override fun initialize(activation_code: String): Unit {
    try {
        val r = plug_pag.initializeAndActivatePinpad(PlugPagActivationData(activation_code))
        if (r.result == PlugPag.RET_OK) return Unit
        else throw Error("$r.errorCode: $r.errorMessage");
    } catch (e: Exception) { throw Error("Ocorreu um erro ao inicializar terminal: $e.message"); }
  }

  override fun abort(): CustomError? {
    var r = plug_pag.abort()
    if (r.result == PlugPag.RET_OK) return null;
    else return CustomError("OPR_ERROR", "Ocorreu um erro ao solicitar cancelamento");
  }

  override fun calculateInstallments(value: String, type: InstallmentTypes): Array<Installment> {
    val t = plug_pag.calculateInstallments(value, type.value)
    
    return t.map { native ->
        Installment(
            quantity = native.quantity.toDouble(),
            amount = native.amount.toDouble(),
            total = native.total.toDouble(),
            formatted_amount = "R$ ${"%.2f".format(native.amount / 100.0)}",
            formatted_total = "R$ ${"%.2f".format(native.total / 100.0)}"
        )
    }.toTypedArray()
  }

  override fun doPayment(payment_data: PaymentData, process_callback: (event: String, code: PaymentEvent) -> Unit): Promise<Variant_CustomError_TransactionResult> {
    return Promise.async {
            try {
                if (!plug_pag.isAuthenticated()) return@async Variant_CustomError_TransactionResult.create(CustomError("AUTH", "POS não autenticado!"));

                @Suppress("REDUNDANT_ELSE_IN_WHEN")
                val type = when (payment_data.type) {
                    PaymentTypes.CREDIT -> PlugPag.TYPE_CREDITO
                    PaymentTypes.DEBIT -> PlugPag.TYPE_DEBITO
                    PaymentTypes.PIX -> PlugPag.TYPE_PIX
                    PaymentTypes.VOUCHER -> PlugPag.TYPE_VOUCHER
                    else -> return@async Variant_CustomError_TransactionResult.create(CustomError("INVALID_PARAM","Tipo de pagamento inválido"))
                }

                @Suppress("REDUNDANT_ELSE_IN_WHEN")
                val installment_type = when (payment_data.installment_type) {
                    InstallmentTypes.NO_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_A_VISTA
                    InstallmentTypes.SELLER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR
                    InstallmentTypes.BUYER_INSTALLMENT -> PlugPag.INSTALLMENT_TYPE_PARC_COMPRADOR
                    else -> return@async Variant_CustomError_TransactionResult.create(CustomError("INVALID_PARAM", "Tipo de parcelamento inválido"))
                }

                val payment_data = PlugPagPaymentData(
                    type = type,
                    amount = payment_data.amount.toInt(),
                    installmentType = installment_type,
                    installments = payment_data.installments.toInt(),
                    userReference = payment_data.user_reference?.match(
                        first = { it },
                        second = { it.toInt().toString() } 
                    ) ?: "",
                    printReceipt = payment_data.print_receipt ?: true,
                    partialPay = false,
                    isCarne = false
                )

                var password_count = 0;

                plug_pag.setEventListener(object : PlugPagEventListener {
                    override fun onEvent(data: PlugPagEventData) {
                        val msg = when (data.eventCode) {
                            PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> {
                                password_count++
                                "SENHA: "+("*".repeat(password_count))
                            }
                            PlugPagEventData.EVENT_CODE_NO_PASSWORD -> {
                                password_count = 0
                                "DIGITE A SENHA"
                            }
                            else -> data.customMessage ?: "AGUARDANDO..."
                        }
                        process_callback(msg, PaymentEvent.values().find{it.value == data.eventCode} ?: PaymentEvent.DEFAULT);
                    }
                })

                val result = plug_pag.doPayment(paymentData = payment_data)

                if (result.result == PlugPag.RET_OK) {
                    return@async Variant_CustomError_TransactionResult.create(result.toTransactionResult())
                } else {
                    plug_pag.abort();
                    var code = result.errorCode ?: "OPR_ERROR";
                    var msg = result.message ?: "Ocorreu um erro ao tentar executar a transação.";
                    return@async Variant_CustomError_TransactionResult.create(CustomError(code, msg))
                }
            } catch (e: PlugPagException) {
                throw Error("Erro ao realizar pagamento: $e.message");
            } catch (e: Exception) {
                throw Error("Erro inesperado: $e.message");
            }
            return@async Variant_CustomError_TransactionResult.create(CustomError("sdad", "dasdad"))
        }
    }

    override fun voidPayment(void_data: VoidPayData, process_callback: (event: String, code:PaymentEvent) -> Unit): Promise<Variant_CustomError_TransactionResult> {
        return Promise.async {
            try {
                var password_count = 0;

                plug_pag.setEventListener(object : PlugPagEventListener {
                    override fun onEvent(data: PlugPagEventData) {
                        val msg = when (data.eventCode) {
                            PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD -> {
                                password_count++
                                "SENHA: "+("*".repeat(password_count))
                            }
                            PlugPagEventData.EVENT_CODE_NO_PASSWORD -> {
                                password_count = 0
                                "DIGITE A SENHA"
                            }
                            else -> data.customMessage ?: "AGUARDANDO..."
                        }
                        process_callback(msg, PaymentEvent.values().find{it.value == data.eventCode} ?: PaymentEvent.DEFAULT);
                    }
                })
                val r = plug_pag.voidPayment(PlugPagVoidData(
                    transactionCode = void_data.transaction_code,
                    transactionId = void_data.transaction_id,
                    printReceipt = void_data.print_receipt?: false,
                    voidType = when(void_data.void_type) {
                        VoidType.PAYMENT -> PlugPag.VOID_PAYMENT 
                        VoidType.QRCODE -> PlugPag.VOID_QRCODE
                        else -> PlugPag.VOID_PAYMENT
                    }
                ))

                if (r.result == PlugPag.RET_OK) return@async Variant_CustomError_TransactionResult.create(r.toTransactionResult())
                else {
                    var code = r.errorCode ?: "OPR_ERROR";
                    var msg = r.message ?: "Ocorreu um erro ao tentar executar a transação.";
                    return@async Variant_CustomError_TransactionResult.create(CustomError(code, msg))
                } 
            } catch (e: PlugPagException) {
                throw Error("Erro ao realizar pagamento: $e.message");
            } catch (e: Exception) {
                throw Error("Erro inesperado: $e.message");
            }
        }
    }

    override fun getLastApprovedTransaction(): Variant_CustomError_TransactionResult {
        val r = plug_pag.getLastApprovedTransaction()   
        if (r.result == PlugPag.RET_OK) return Variant_CustomError_TransactionResult.create(r.toTransactionResult());

        var code = r.errorCode ?: "OPR_ERROR";
        var msg = r.message ?: "Ocorreu um erro ao requisitar ultima transação.";
        return Variant_CustomError_TransactionResult.create(CustomError(code, msg));
    }
}
