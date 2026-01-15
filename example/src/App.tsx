import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import PaymentScreen from './payhook';
import RefundScreen from './refundhook';
import RegularPay from './pay';



type ScreenType = 'hub' | 'payment' | 'refund' | 'regular';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('hub');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'payment': return <PaymentScreen />;
      case 'refund': return <RefundScreen />;
      case 'regular': return <RegularPay />
      default:
        return renderHub();
    }
  };

  const renderHub = () => (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>PagSeguro TEF</Text>
        <Text style={styles.headerSubtitle}>
          Sistema de Pagamentos
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Selecione uma operação:
        </Text>

        <TouchableOpacity
          style={[styles.card, styles.paymentCard]}
          onPress={() => setCurrentScreen('payment')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>💳</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Novo Pagamento</Text>
            <Text style={styles.cardDescription}>
              Processar pagamento via cartão de crédito, débito ou PIX
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.refundCard]}
          onPress={() => setCurrentScreen('refund')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>↩️</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Estorno/Cancelamento</Text>
            <Text style={styles.cardDescription}>
              Cancelar uma transação já processada
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.refundCard]}
          onPress={() => setCurrentScreen('regular')}
          activeOpacity={0.7}
        >
          <View style={styles.cardIconContainer}>
            <Text style={styles.cardIcon}>☕</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Classe Estatica</Text>
            <Text style={styles.cardDescription}>
              Funções da classe estatica PagSeguro
            </Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹInformações</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Terminal conectado e pronto para uso
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Aceita crédito, débito, voucher e PIX
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>
              Comprovantes disponíveis via email
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          PagSeguro © 2026
        </Text>
      </View>
    </View>
  );

  if (currentScreen !== 'hub') {
    return (
      <View style={styles.screenContainer}>
        <View style={styles.navbar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen('hub')}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.navbarTitle}>
            {currentScreen === 'payment' ? 'Pagamento' : currentScreen === 'regular' ? 'Classe Estatica' : 'Estorno'}
          </Text>
          <View style={styles.navbarSpacer} />
        </View>
        <View style={styles.screenContent}>
          {renderScreen()}
        </View>
      </View>
    );
  }

  return renderHub();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
  },
  paymentCard: {
    borderLeftColor: '#2196F3',
  },
  refundCard: {
    borderLeftColor: '#FF9800',
  },
  cardIconContainer: {
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  cardArrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  infoBullet: {
    fontSize: 16,
    color: '#1976D2',
    marginRight: 8,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backIcon: {
    fontSize: 20,
    color: '#2196F3',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  navbarSpacer: {
    width: 80,
  },
  screenContent: {
    flex: 1,
  },
});