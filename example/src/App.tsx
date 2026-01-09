// App.tsx
import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import PagSeguro, { PaymentTypes, InstallmentTypes, type TransactionResult, VoidType } from 'react-native-pos-pagseguro';

const ACTIVATION_CODE = '<seu codigo aqui>'; // Substitua pelo seu código real
const TEST_AMOUNT = 2000;

export default function App() {
  const [isInitialized, setIsInitialized] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    model: string;
    serial: string;
    authenticated: boolean;
    capabilities: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [process, setProcess] = useState<string>("");
  const [subAcquirer, setSubAcquirer] = useState<any>(null);
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);

  useEffect(() => {
    checkDeviceStatus();
  }, []);

  const checkDeviceStatus = async () => {
    setIsBusy(PagSeguro.is_busy());
    const authenticated = PagSeguro.is_authenticated();

    const capabilities = [];
    if (PagSeguro.capabilities.has_bluetooth()) capabilities.push('Bluetooth');
    if (PagSeguro.capabilities.has_icc()) capabilities.push('Chip (ICC)');
    if (PagSeguro.capabilities.has_mag()) capabilities.push('Tarja Magnética');
    if (PagSeguro.capabilities.has_picc()) capabilities.push('Contactless (NFC)')
    if (PagSeguro.capabilities.has_printer()) capabilities.push('Impressora');

    setDeviceInfo({
      model: PagSeguro.get_model(),
      serial: PagSeguro.get_serial_number(),
      authenticated,
      capabilities,
    });

    try {
      const data = PagSeguro.get_userdata();
      setUserData(data);
    } catch (error) {
      console.warn('Não foi possível obter os dados do usuário');
      setUserData(null);
    }

    try {
      const sub = PagSeguro.get_sub_acquirer_data();
      console.log(sub)
      setSubAcquirer(sub);
    } catch (error) {
      setSubAcquirer(null);
    }
  };

  const initializePOS = async () => {
    setLoading(true);
    try {
      PagSeguro.initialize(ACTIVATION_CODE);
      setIsInitialized(true);
      Alert.alert('Sucesso', 'Terminal inicializado com sucesso!');
      checkDeviceStatus();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao inicializar o terminal PagSeguro');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const performPayment = async (paymentConfig: {
    title: string;
    type: PaymentTypes;
    installment_type: InstallmentTypes;
    installments: number;
  }) => {
    if (!isInitialized) {
      Alert.alert('Atenção', 'Inicialize o terminal primeiro');
      return;
    }
    if (PagSeguro.is_busy()) {
      Alert.alert('Ocupado', 'Aguarde a operação atual terminar');
      return;
    }

    setLoading(true);
    try {
      await PagSeguro.do_payment({
        amount: TEST_AMOUNT,
        type: paymentConfig.type,
        installment_type: paymentConfig.installment_type,
        user_reference: 1203,
        installments: paymentConfig.installments,
        print_receipt: true,
      }, (msg, code) => {
        setProcess(msg);
        console.log(code)
      }).then(e => { setProcess("") });

      Alert.alert('Sucesso!', `${paymentConfig.title} realizado com sucesso!`);
    } catch (error: any) {
      Alert.alert(
        'Falha no Pagamento',
        error?.message || 'Erro desconhecido ao processar pagamento'
      );
      console.log(error.message);
    } finally {
      setProcess("")
      setLoading(false);
    }
  };

  const fetchLastTransaction = async () => {
    try {
      const transaction = PagSeguro.get_last_approved_transaction();
      setLastTransaction(transaction);
    } catch (error) {
      Alert.alert('Aviso', 'Não foi possível obter a última transação aprovada');
      setLastTransaction(null);
    }
  };

  const voidLastPayment = async () => {
    if (!lastTransaction) {
      Alert.alert('Atenção', 'Não há transação aprovada para cancelar');
      return;
    }

    if (!lastTransaction.transaction_code || !lastTransaction.transaction_id) {
      Alert.alert('Erro', 'Dados insuficientes para cancelamento (falta transaction_code ou id)');
      return;
    }

    Alert.alert(
      'Confirmar Cancelamento',
      `Deseja realmente cancelar a transação de R$ ${(parseInt(lastTransaction.amount || '0') / 100).toFixed(2)}?`,
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await PagSeguro.void_payment({
                transaction_code: lastTransaction.transaction_code!,
                transaction_id: lastTransaction.transaction_id!,
                print_receipt: true,
                void_type: VoidType.PAYMENT, // PAYMENT (use 2 apenas se for QR Code PIX não pago)
              }, (msg, code) => {
                setProcess(msg);
                console.log(code)
              }).then(console.log);

              Alert.alert('Sucesso', 'Transação cancelada com sucesso!');
              setLastTransaction(null); // Limpa após cancelamento
            } catch (error: any) {
              Alert.alert('Falha no Cancelamento', error?.message || 'Erro desconhecido');
            } finally {
              setLoading(false);
              setProcess('')
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>PagSeguro POS Demo</Text>

        {loading && <ActivityIndicator size="large" color="#00b259" style={styles.loader} />}

        {deviceInfo && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações do Terminal</Text>
            <Text>• Modelo: {deviceInfo.model}</Text>
            <Text>• Serial: {deviceInfo.serial}</Text>
            <Text>• Autenticado: {deviceInfo.authenticated ? 'Sim' : 'Não'}</Text>
            <Text style={styles.subtitle}>Recursos disponíveis:</Text>
            {deviceInfo.capabilities.length > 0 ? (
              deviceInfo.capabilities.map((cap) => (
                <Text key={cap}>   ◦ {cap}</Text>
              ))
            ) : (
              <Text>   Nenhum recurso detectado</Text>
            )}
          </View>
        )}

        {/* Dados do Usuário / Estabelecimento */}
        {userData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados do Estabelecimento</Text>
            {userData.company_name && <Text>• Razão Social: {userData.company_name}</Text>}
            {userData.nick_name && <Text>• Nome Fantasia: {userData.nick_name}</Text>}
            {userData.cnpj_cpf && <Text>• CPF/CNPJ: {userData.cnpj_cpf}</Text>}
            {userData.email && <Text>• E-mail: {userData.email}</Text>}
            {userData.address && <Text>• Endereço: {userData.address}</Text>}
            {userData.address_complement && <Text>• Complemento: {userData.address_complement}</Text>}
            {userData.city && userData.address_state && (
              <Text>• Cidade/UF: {userData.city} - {userData.address_state}</Text>
            )}
            {Object.keys(userData).length === 0 && <Text>Nenhum dado disponível</Text>}
          </View>
        )}

        {!userData && deviceInfo?.authenticated && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados do Estabelecimento</Text>
            <Text style={{ color: '#666' }}>Nenhum dado de usuário retornado</Text>
          </View>
        )}

        {subAcquirer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados do Estabelecimento (SubAcquirer)</Text>
            {subAcquirer.full_name && <Text>• Nome Completo: {subAcquirer.full_name}</Text>}
            {subAcquirer.name && <Text>• Nome: {subAcquirer.name}</Text>}
            {subAcquirer.cnpj_cpf && <Text>• CNPJ/CPF: {subAcquirer.cnpj_cpf}</Text>}
            {subAcquirer.doc_type && <Text>• Tipo Doc: {subAcquirer.doc_type}</Text>}
            {subAcquirer.mcc && <Text>• MCC: {subAcquirer.mcc}</Text>}
            {subAcquirer.merchant_id && <Text>• ID Merchant: {subAcquirer.merchant_id}</Text>}
            {subAcquirer.address && <Text>• Endereço: {subAcquirer.address}</Text>}
            {subAcquirer.city && <Text>• Cidade: {subAcquirer.city}</Text>}
            {subAcquirer.uf && <Text>• UF: {subAcquirer.uf}</Text>}
            {subAcquirer.zip_code && <Text>• CEP: {subAcquirer.zip_code}</Text>}
            {subAcquirer.telephone && <Text>• Telefone: {subAcquirer.telephone}</Text>}
            {subAcquirer.country && <Text>• País: {subAcquirer.country}</Text>}
          </View>
        )}

        {lastTransaction && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Última Transação Aprovada</Text>
            <Text>• Valor: R$ {(parseInt(lastTransaction.amount || '0') / 100).toFixed(2)}</Text>
            <Text>• Bandeira: {lastTransaction.card_brand || 'PIX/Voucher'}</Text>
            <Text>• Tipo: {lastTransaction.payment_type === 5 ? 'PIX' : lastTransaction.payment_type === 2 ? 'Débito' : 'Crédito'}</Text>
            <Text>• Parcelas: {lastTransaction.installments || 1}x</Text>
            <Text>• NSU: {lastTransaction.transaction_code}</Text>
            <Text>• ID: {lastTransaction.transaction_id}</Text>
            <Text>• Data/Hora: {lastTransaction.date} {lastTransaction.time}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Recarregar informações" onPress={checkDeviceStatus} color="#3f0092ff" />
          <View style={styles.buttonSpacing} />

          {!!process && (
            <View style={{ borderRadius: 8, borderWidth: 1, borderColor: 'red', padding: 3 }}>
              <Text style={{ color: 'red', fontSize: 18 }}>{process}</Text>
            </View>
          )}
          {isInitialized && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Testar Pagamentos (R$ 20,00)</Text>

              <View style={styles.paymentGrid}>
                {/* Crédito à vista */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#0066cc' }]}
                  onPress={() =>
                    performPayment({
                      title: 'Crédito à Vista',
                      type: PaymentTypes.CREDIT,
                      installment_type: InstallmentTypes.NO_INSTALLMENT,
                      installments: 1,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>Crédito{'\n'}À Vista</Text>
                </TouchableOpacity>

                {/* Crédito Parcelado Loja (sem juros) */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#00b259' }]}
                  onPress={() =>
                    performPayment({
                      title: 'Crédito 6x Sem Juros',
                      type: PaymentTypes.CREDIT,
                      installment_type: InstallmentTypes.SELLER_INSTALLMENT,
                      installments: 6,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>Crédito{'\n'}6x Loja</Text>
                </TouchableOpacity>

                {/* Crédito Parcelado Comprador (com juros) */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#ff6b00' }]}
                  onPress={() =>
                    performPayment({
                      title: 'Crédito 4x Com Juros',
                      type: PaymentTypes.CREDIT,
                      installment_type: InstallmentTypes.BUYER_INSTALLMENT,
                      installments: 4,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>Crédito{'\n'}4x Comprador</Text>
                </TouchableOpacity>

                {/* Débito */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#d32f2f' }]}
                  onPress={() =>
                    performPayment({
                      title: 'Débito',
                      type: PaymentTypes.DEBIT,
                      installment_type: InstallmentTypes.NO_INSTALLMENT,
                      installments: 1,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>Débito</Text>
                </TouchableOpacity>

                {/* Voucher */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#9c27b0' }]}
                  onPress={() =>
                    performPayment({
                      title: 'Voucher (Refeição)',
                      type: PaymentTypes.VOUCHER,
                      installment_type: InstallmentTypes.NO_INSTALLMENT,
                      installments: 1,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>Voucher{'\n'}Refeição</Text>
                </TouchableOpacity>

                {/* PIX */}
                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: '#00bfa5' }]}
                  onPress={() =>
                    performPayment({
                      title: 'PIX',
                      type: PaymentTypes.PIX,
                      installment_type: InstallmentTypes.NO_INSTALLMENT,
                      installments: 1,
                    })
                  }
                >
                  <Text style={styles.paymentButtonText}>PIX</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <Button title="Cancelar operação" onPress={() => PagSeguro.abort_current_operation()} color="#ff4747ff" />

        <View style={styles.buttonContainer}>
          {isInitialized && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ações Avançadas</Text>

              <Button
                title="Consultar Última Transação"
                onPress={fetchLastTransaction}
                color="#555"
              />

              <View style={styles.buttonSpacing} />

              <Button
                title="CANCELAR Última Transação"
                onPress={voidLastPayment}
                color="#c62828"
                disabled={!lastTransaction}
              />
            </View>
          )}

          {!isInitialized ? (
            <Button title="Inicializar Terminal" onPress={initializePOS} color="#00b259" />
          ) : (
            <>
              {/*  <Button title="Reboot"
                onPress={() => {
                  PagSeguro.reboot();
                }}
                color="#f3b600ff"
              /> */}

              <View style={styles.buttonSpacing} />

              <Button title="Reprint consumer"
                onPress={() => {
                  PagSeguro.reprint_customer_receipt().then((s) => console.log(`consumer: ${s} steps`))
                }}
                color="#0065f3ff"
              />
              <Button
                title="Reprint stablishment"
                onPress={() => {
                  PagSeguro.reprint_stablishment_receipt().then((s) => console.log(`stablishment: ${s} steps`))
                }}
                color="#00f392ff"
              />

              <View style={styles.buttonSpacing} />
            </>
          )}
        </View>


        {isBusy && (
          <Text style={styles.busyText}>Terminal ocupado no momento...</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#00b259',
  },
  loader: {
    marginVertical: 20,
  },
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentButton: {
    flexBasis: '30%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  paymentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    marginTop: 8,
    fontWeight: '600',
    color: '#555',
  },
  buttonContainer: {
    gap: 14,
    marginTop: 10,
  },
  buttonSpacing: {
    height: 10,
  },
  busyText: {
    textAlign: 'center',
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 20,
  },
});
