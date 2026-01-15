# react-native-pos-pagseguro

**PagSeguro POS SDK for React Native** – Integration with PagSeguro terminals (Moderninha, Moderninha2, etc.) using react-native-nitro-modules.

Supports credit, debit, voucher, PIX payments, installments, cancellations, receipt printing, and more.
[![npm version](https://badge.fury.io/js/react-native-pos-pagseguro.svg)](https://badge.fury.io/js/react-native-pos-pagseguro) 
[![Platform](https://img.shields.io/badge/platform-Android-yellow.svg)](https://www.android.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Initialize and activate** PagSeguro terminals
- **Payments:** Credit, Debit, Voucher, PIX
- **Installments:** (à vista, store installment without interest, buyer installment with interest)
- **Cancel/refund:** transactions (same-day only)
- **Easy use payment Hook** 
- **Easy use refund Hook** 
- Get last approved transaction
- **Reprint:** customer or merchant receipt
- Custom image printing (file path or Base64)
- Abort ongoing operations
- Reboot terminal
- **Device info:** model, serial number, user data, sub-acquirer data
- **Capability detection:** printer, NFC, chip, magnetic stripe, etc.
- **Software Capability detection:** can activate, can activate remotely, can refund, etc.
- Progress callbacks during payment flow

## Installation

```bash
npm install react-native-pos-pagseguro react-native-nitro-modules
```
## or
```bash
yarn add react-native-pos-pagseguro react-native-nitro-modules
```
### Post-install steps

Since this library uses **react-native-nitro-modules**, you need to rebuild your app after installation:

```bash
npx react-native run-android  
```


## Requirements

- **Platform**: Android only
- React Native ≥ 0.71
- react-native-nitro-modules ≥ 0.30

## Usage

### 1. Initialize the terminal (required first step)

```typescript
import PagSeguro from 'react-native-pos-pagseguro';

// Must be called once with your activation code provided by PagSeguro
try {
  PagSeguro.initialize('YOUR_ACTIVATION_CODE_HERE');
  console.log('Terminal initialized successfully');
} catch (error) {
  console.error('Initialization failed:', error);
}
```


### 2. Make a payment
```typescript
import PagSeguro, { PaymentTypes, InstallmentTypes, PaymentEvent } from 'react-native-pos-pagseguro';

try {
  const result = await PagSeguro.do_payment({
    amount: 1000, // R$ 10,00 (in cents)
    type: PaymentTypes.CREDIT,
    installment_type: InstallmentTypes.SELLER_INSTALLMENT,
    installments: 3,
    print_receipt: true,
    user_reference: 12345, // optional
  }, (statusMessage, code) => {
    console.log('Progress:', statusMessage); // e.g., "APROXIME, INSIRA OU PASSE O CARTÃO"

    switch(){
      case PaymentEvent.CONTACTLESS_ERROR: console.log("Erro de leitura NFC")
        break;
      case PaymentEvent.USE_CHIP: console.log("Use o chip!")
    }
  });

  console.log('Payment approved!', result.transaction_code, result.nsu);
} catch (error) {
  console.error('Payment failed:', error.code, error.message);
}
```

### 2.1. Make a payment with hook
[Full example here](https://github.com/CECSMH/react-native-pos-pagseguro/blob/main/example/src/payhook.tsx)
```typescript
const {
    request_payment,
    abort_operation,
    reset,
    state,
    message,
    errors,
    isError,
    isSuccess,
    isProcessing,
} = usePagPayment();

const handlePayment = async () => {
    const paymentData: PaymentData = {
        amount,
        type: PaymentTypes.DEBIT,
        installment_type: InstallmentTypes.NO_INSTALLMENT,
        installments: 1,
        print_receipt: false,
        user_reference: `ORDER${Date.now()}`,
    };
    try {
        const result = await request_payment(paymentData);
        Alert.alert(
            'Pagamento Aprovado! ✓',
            `NSU: ${result.nsu}\nAutorização: ${result.auto_code}\nBandeira: ${result.card_brand}`,
            [{ text: 'OK', onPress: () => reset() }]
        );
    } catch (error) {console.log(error)
        Alert.alert(
            'Erro no Pagamento ✗',
            errors?.message || 'Falha ao processar pagamento',
            [{ text: 'OK', onPress: () => reset() }]
        );
    }

    console.log(message) // Digite sua senha.

    const getStateIcon = () => {
      switch (state) {
          case HookPayState.WAITING_CARD:
              return '💳';
          case HookPayState.CARD_INSERTED:
              return '✓';
          case HookPayState.ENTER_PASSWORD:
          ...
      }
    };

};
```

### 3. Cancel a payment (same day only)
```typescript
try {
  const cancelResult = await PagSeguro.void_payment({
    transaction_code: '123456789',
    transaction_id: 'ABCDEF123456',
    print_receipt: true,
  }, (statusMessage, code) => {
    console.log('Progress:', statusMessage); // e.g., "APROXIME, INSIRA OU PASSE O CARTÃO"
    if(code == PaymentEvent.USE_CHIP) console.log("Use o chip!")
  });

  console.log('Cancellation successful:', cancelResult);
} catch (error) {
  console.error('Cancellation failed:', error);
}
```

### 3.1. Cancel a payment with hook (same day only)
[Full example here](https://github.com/CECSMH/react-native-pos-pagseguro/blob/main/example/src/refundhook.tsx)
```typescript
const {
    request_refund,
    abort_operation,
    reset,
    state,
    message,
    errors,
    isError,
    isSuccess,
    isProcessing,
} = usePagRefund();

const [transactionCode, setTransactionCode] = useState('');
const [transactionId, setTransactionId] = useState('');

const handleRefund = async () => {
    if (!transactionCode.trim()) {
        Alert.alert('Atenção', 'Informe o código da transação');
        return;
    }
    if (!transactionId.trim()) {
        Alert.alert('Atenção', 'Informe o ID da transação');
        return;
    }
    const refundData: VoidPayData = {
        transaction_code: transactionCode.trim(),
        transaction_id: transactionId.trim(),
        print_receipt: false,
        void_type: VoidType.PAYMENT,
    };
    try {
        const result = await request_refund(refundData);
        Alert.alert(
            'Estorno Aprovado! ✓',
            `NSU: ${result.nsu}\nCódigo: ${result.transaction_code}\nData: ${result.date} ${result.time}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        reset();
                        setTransactionCode('');
                        setTransactionId('');
                    }
                }
            ]
        );
    } catch (error) {
        Alert.alert(
            'Erro no Estorno ✗',
            errors?.message || 'Falha ao processar estorno',
            [{ text: 'OK', onPress: () => reset() }]
        );
    }
}

console.log(message) // Autorizando estorno...

const getStateIcon = () => {
   switch (state) {
       case HookPayState.WAITING_CARD:
           return '💳';
       case HookPayState.CARD_INSERTED:
           return '✓';
       case HookPayState.ENTER_PASSWORD:
       case HookPayState.ENTER_CVV:
           return '🔒';
        ...
   }
}:
```


### 4. Reprint receipts
```typescript
try {
  await PagSeguro.reprint_customer_receipt();
  console.log('Customer receipt reprinted');
} catch (error) {
  console.error('Print failed:', error);
}
```
### 5. Customize Payment, Print & Operation Dialogs
```typescript
PagSeguro.set_modal_styles({
  head_text_color: "#FFFFFF",
  head_background_color: "#0000FF",           // Blue header background
  content_text_color: "black",
  content_text_value1_color: "#FF0000",       // Red for main amounts/values
  content_text_value2_color: "#00FF00",       // Green for secondary values
  positive_button_text_color: "white",
  positive_button_background: "#008000",      // Green "Confirm/OK" button
  negative_button_text_color: "white",
  negative_button_background: "#FF0000",      // Red "Cancel" button
  generic_button_background: "#CCCCCC",
  generic_button_text_color: "black",
  generic_sms_edit_text_background: "#F5F5F5",
  generic_sms_edit_text_text_color: "blue",
  line_color: "#999999"                       // Dividers color
});

PagSeguro.set_printer_modal_styles({
  title: "Confirmação de Pagamento?",
  title_color: "blue",
  confirm_text_color: "green",
  cancel_text_color: "red",
  window_background_color: "#FFFFFF",
  button_background_color: "#0000FF",
  button_background_color_disabled: "#AAAAAA",
  send_sms_text_color: "black",
  max_time_show_popup: 15.0     // Timeout in seconds
});
```

### 6. Check device capabilities
```typescript
if (PagSeguro.capabilities.has_printer()) {
  console.log('This terminal has a thermal printer');
}

if (PagSeguro.capabilities.has_picc()) {
  console.log('Supports contactless (NFC) payments');
}
```

### 7. Get device info
```typescript
console.log('Model:', PagSeguro.get_model());
console.log('Serial:', PagSeguro.get_serial_number());
console.log('User data:', PagSeguro.get_userdata());
```
### 8. Calculate installments
```typescript
//InstallmentTypes.SELLER_INSTALLMENT or InstallmentTypes.BUYER_INSTALLMENT
// R$ 230,00
const installments = PagSeguro.calculate_installments(23000, InstallmentTypes.SELLER_INSTALLMENT);
console.log(installments)
/*[{
    "quantity": 2, 
    "amount": 11500,
    "total": 23000,
    "formatted_amount": "R$ 115,00",
    "formatted_total": "R$ 230,00"
} 
...]*/
```
### 8. Check Software capabilities
```typescript
console.log("can activate: ", PagSeguro.software.can_activate());
console.log("can activate remotely: ", PagSeguro.software.can_activate_remotely());
console.log("can reprint: ", PagSeguro.software.can_reprint());
//...
```

## Error Handling


- `PaymentError` – Payment, validation, or communication issues
- `PrintError` – Printing or reprinting failures
- `AbordError` – Failure when trying to abort an operation
```typescript
try {
  await PagSeguro.do_payment(data);
} catch (e) {
  if (e instanceof PaymentError) {
    console.log('Payment error:', e.code, e.message);
  }
}
```

## API Reference

All types and enums are fully typed. exports:

- `PagSeguro` (main class)
- `PaymentData`
- `usePagRefund`
- `usePagPayment`
- `HookPayState`
- `TransactionResult`
- `VoidPayData`
- `PaymentTypes`
- `InstallmentTypes`
- `VoidType`
- `PaymentEvent`
- `PrintError`
- `PaymentError`
- `StyleData`
- `CustomPrinterLayout`

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please include tests and update documentation as needed.

## Support the Project ☕

If you've found this library helpful, consider buying me a coffee!



Scan the QR code to donate (PIX):

![PIX donation QR code](https://api.qrserver.com/v1/create-qr-code/?data=00020126580014BR.GOV.BCB.PIX013698817f09-40db-47c0-adf3-0c69b99ef1635204000053039865802BR5924Carlos%20Eduardo%20Conceicao6009SAO%20PAULO62140510rmQmKYzFZ863046800)

Thank you for your support! 🚀

## License

MIT License. See LICENSE for details.

## Support

For issues or questions, open an issue on the GitHub repository or contact the maintainers.