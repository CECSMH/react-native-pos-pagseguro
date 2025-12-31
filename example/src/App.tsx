import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import NitroModules from 'react-native-nitro-modules';

// Import your types
import { InstallmentTypes, PaymentTypes, type PaymentData } from 'react-native-pos-pagseguro';

export default function App() {
  const [status, setStatus] = useState<string>('Não inicializado');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  // Create the hybrid object once
  const posPagseguro = useRef<any>(null);

  useEffect(() => {
  }, []);

  const initialize = async () => {
    if (!posPagseguro.current) return;

    setLoading(true);
    setStatus('Inicializando terminal...');
    setMessages([]);

    try {
      await posPagseguro.current?.initialize('SEU_CODIGO_DE_ATIVACAO_AQUI');
      setStatus('Terminal ativado com sucesso!');
      Alert.alert('Sucesso', 'Terminal PagSeguro ativado!');
    } catch (error: any) {
      setStatus('Falha na ativação');
      Alert.alert('Erro', error.message || 'Não foi possível ativar o terminal');
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async () => {
    if (!posPagseguro.current) {
      Alert.alert('Erro', 'Módulo não inicializado');
      return;
    }

    setLoading(true);
    setStatus('Iniciando pagamento...');
    setMessages(['Aproxime, insira ou passe o cartão']);

    const paymentData: PaymentData = {
      type: PaymentTypes.CREDIT, // or 'DEBIT', 'PIX_QR_CODE'
      amount: 10.50, // R$ 10,50
      installment_type: InstallmentTypes.NO_INSTALLMENT, // or SELLER_INSTALLMENT, BUYER_INSTALLMENT
      installments: 1,
      print_receipt: true,
      user_reference: +Math.random().toString(36).substring(7), // optional ID
    };

    try {
      await posPagseguro.current.doPayment(paymentData);
      setStatus('Processando pagamento...');
    } catch (error: any) {
      setLoading(false);
      setStatus('Erro ao iniciar');
      Alert.alert('Erro', error.message || 'Falha ao iniciar pagamento');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PagSeguro POS</Text>

      <Text style={styles.status}>Status: {status}</Text>

      <View style={styles.buttonContainer}>
        <Button title="Ativar Terminal" onPress={initialize} disabled={loading} />
        <View style={styles.gap} />
        <Button
          title="Realizar Pagamento (R$ 10,50)"
          onPress={startPayment}
          disabled={loading || status !== 'Terminal ativado com sucesso!'}
        />
      </View>

      {loading && <ActivityIndicator size="large" color="#0E4772" style={styles.loader} />}

      {messages.length > 0 && (
        <ScrollView style={styles.messagesContainer}>
          <Text style={styles.messagesTitle}>Mensagens do terminal:</Text>
          {messages.map((msg, i) => (
            <Text key={i} style={styles.message}>
              {msg}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0E4772',
  },
  status: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  gap: {
    height: 10,
  },
  loader: {
    marginVertical: 20,
  },
  messagesContainer: {
    flex: 1,
    maxHeight: 200,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  messagesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    fontFamily: 'monospace',
    fontSize: 16,
    marginVertical: 2,
  },
});