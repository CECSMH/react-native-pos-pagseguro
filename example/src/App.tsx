// App.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import PagSeguro, { PaymentTypes, InstallmentTypes } from 'react-native-pos-pagseguro';

const ACTIVATION_CODE = '749879'; // Substitua pelo seu código real

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    model: string;
    serial: string;
    authenticated: boolean;
    capabilities: string[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [subAcquirer, setSubAcquirer] = useState<any>(null);

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

  const performPayment = async () => {
    if (!isInitialized) {
      Alert.alert('Atenção', 'É necessário inicializar o terminal primeiro');
      return;
    }

    if (PagSeguro.is_busy()) {
      Alert.alert('Ocupado', 'O terminal está processando outra operação');
      return;
    }

    setLoading(true);

    try {
      const d = await PagSeguro.do_payment({
        amount: 1000, // R$ 10,00 (valor em centavos)
        type: PaymentTypes.CREDIT,
        installment_type: InstallmentTypes.SELLER_INSTALLMENT,
        installments: 1,
        print_receipt: true,
        user_reference: 300
      });
      console.log(d)

      Alert.alert('Sucesso', 'Pagamento realizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Falha no pagamento', error?.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      setLoading(false);
      checkDeviceStatus();
    }
  };

  const deactivatePOS = async () => {
    setLoading(true);
    try {
      await PagSeguro.deactivate();
      setIsInitialized(false);
      Alert.alert('Desativado', 'Terminal desativado com sucesso');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao desativar');
    } finally {
      setLoading(false);
    }
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

        <View style={styles.buttonContainer}>
          <Button title="Recarregar informações" onPress={checkDeviceStatus} color="#3f0092ff" />
          <View style={styles.buttonSpacing} />
          {!isInitialized ? (
            <Button title="Inicializar Terminal" onPress={initializePOS} color="#00b259" />
          ) : (
            <>
              <Button title="Realizar Pagamento (R$ 10,00 Crédito)" onPress={performPayment} />
              <View style={styles.buttonSpacing} />
              <Button title="Desativar Terminal" onPress={deactivatePOS} color="#d32f2f" />
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