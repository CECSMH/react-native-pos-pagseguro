import { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import PagSeguro, { HookPayState, InstallmentTypes, PaymentTypes, usePagPayment, type PaymentData } from 'react-native-pos-pagseguro';


export default function PaymentScreen() {
    const [amount, setAmount] = useState(5000); // R$ 50,00 em centavos
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
    };

    const handleAbort = () => {
        Alert.alert(
            'Cancelar Pagamento',
            'Deseja realmente cancelar esta transação?',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim',
                    style: 'destructive',
                    onPress: () => abort_operation(),
                },
            ]
        );
    };

    const getStateIcon = () => {
        switch (state) {
            case HookPayState.WAITING_CARD:
                return '💳';
            case HookPayState.CARD_INSERTED:
                return '✓';
            case HookPayState.ENTER_PASSWORD:
            case HookPayState.ENTER_CVV:
                return '🔒';
            case HookPayState.DIGIT_PASSWORD:
                return '⌨️';
            case HookPayState.AUTHORIZING:
                return '⏳';
            case HookPayState.APPROVED:
            case HookPayState.SUCCESS:
                return '✅';
            case HookPayState.REPROVED:
            case HookPayState.ERROR:
                return '❌';
            case HookPayState.WAITING_REMOVE_CARD:
                return '⏏️';
            case HookPayState.USE_CHIP:
                return '🔌';
            case HookPayState.CONTACTLESS_ON_DEVICE:
                return '📱';
            case HookPayState.DOWNLOADING_TABLES:
            case HookPayState.RECORDING_TABLES:
                return '📥';
            default:
                return '💰';
        }
    };

    const getStateColor = () => {
        if (isSuccess) return '#4CAF50';
        if (isError) return '#F44336';
        if (isProcessing) return '#2196F3';
        return '#757575';
    };

    const getInstructions = () => {
        switch (state) {
            case HookPayState.WAITING_CARD:
                return {
                    title: 'Aguardando Cartão',
                    steps: [
                        'Insira o cartão com chip',
                        'Ou passe a tarja magnética',
                        'Ou aproxime para pagamento contactless'
                    ]
                };
            case HookPayState.ENTER_PASSWORD:
                return {
                    title: 'Digite sua Senha',
                    steps: [
                        'Digite sua senha no terminal',
                        'Pressione confirmar'
                    ]
                };
            case HookPayState.ENTER_CVV:
                return {
                    title: 'Digite o CVV',
                    steps: [
                        'Digite o código de segurança',
                        'CVV está no verso do cartão'
                    ]
                };
            case HookPayState.WAITING_REMOVE_CARD:
                return {
                    title: 'Remova o Cartão',
                    steps: [
                        'Retire o cartão do terminal',
                        'Aguarde a finalização'
                    ]
                };
            case HookPayState.USE_CHIP:
                return {
                    title: 'Use o Chip',
                    steps: [
                        'Insira o cartão com o chip',
                        'Não use a tarja magnética'
                    ]
                };
            case HookPayState.AUTHORIZING:
                return {
                    title: 'Autorizando',
                    steps: [
                        'Aguarde a autorização',
                        'Isso pode levar alguns segundos'
                    ]
                };
            default:
                return null;
        }
    };

    const instructions = getInstructions();

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Terminal de Pagamento</Text>
                <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Valor a Pagar:</Text>
                    <Text style={styles.amount}>
                        R$ {(amount / 100).toFixed(2).replace('.', ',')}
                    </Text>
                </View>
            </View>

            {/* Card de Status Principal */}
            <View style={[styles.statusCard, { borderLeftColor: getStateColor() }]}>
                <Text style={styles.statusIcon}>{getStateIcon()}</Text>
                <Text style={[styles.statusText, { color: getStateColor() }]}>
                    {message || 'Pronto para processar'}
                </Text>

                {isProcessing && (
                    <ActivityIndicator
                        size="large"
                        color={getStateColor()}
                        style={styles.loader}
                    />
                )}
            </View>

            {/* Instruções Contextuais */}
            {instructions && (
                <View style={styles.instructionCard}>
                    <Text style={styles.instructionTitle}>{instructions.title}</Text>
                    {instructions.steps.map((step, index) => (
                        <View key={index} style={styles.instructionRow}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.instructionText}>{step}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Indicadores de Estado */}
            <View style={styles.indicators}>
                <View style={styles.indicator}>
                    <View
                        style={[
                            styles.indicatorDot,
                            isProcessing && styles.indicatorActive,
                        ]}
                    />
                    <Text style={styles.indicatorText}>Processando</Text>
                </View>
                <View style={styles.indicator}>
                    <View
                        style={[
                            styles.indicatorDot,
                            isSuccess && styles.indicatorSuccess,
                        ]}
                    />
                    <Text style={styles.indicatorText}>Sucesso</Text>
                </View>
                <View style={styles.indicator}>
                    <View
                        style={[
                            styles.indicatorDot,
                            isError && styles.indicatorError,
                        ]}
                    />
                    <Text style={styles.indicatorText}>Erro</Text>
                </View>
            </View>

            {/* Botões de Ação */}
            <View style={styles.buttonContainer}>
                {!isProcessing && !isSuccess && !isError && (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={handlePayment}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonIcon}>💳</Text>
                        <Text style={styles.buttonText}>Iniciar Pagamento</Text>
                    </TouchableOpacity>
                )}

                {isProcessing && (
                    <TouchableOpacity
                        style={[styles.button, styles.dangerButton]}
                        onPress={handleAbort}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonIcon}>✗</Text>
                        <Text style={styles.buttonText}>Cancelar Transação</Text>
                    </TouchableOpacity>
                )}

                {(isSuccess || isError) && (
                    <TouchableOpacity
                        style={[styles.button, styles.secondaryButton]}
                        onPress={() => reset()}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonIcon}>↻</Text>
                        <Text style={styles.buttonText}>Nova Transação</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Debug Info (opcional - remover em produção) */}
            <View style={styles.debugContainer}>
                <Text style={styles.debugLabel}>Estado Atual:</Text>
                <Text style={styles.debugText}>{state}</Text>
            </View>

            {/* Informações de Erro */}
            {isError && errors && (
                <View style={styles.errorCard}>
                    <Text style={styles.errorTitle}>⚠️ Detalhes do Erro</Text>
                    <Text style={styles.errorText}>
                        {errors.message || 'Erro desconhecido'}
                    </Text>
                    {errors.code && (
                        <Text style={styles.errorCode}>Código: {errors.code}</Text>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
    },
    amountLabel: {
        fontSize: 14,
        color: '#666',
    },
    amount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    statusCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 24,
        borderRadius: 12,
        borderLeftWidth: 4,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        alignItems: 'center',
    },
    statusIcon: {
        fontSize: 64,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
    },
    loader: {
        marginTop: 16,
    },
    instructionCard: {
        backgroundColor: '#E3F2FD',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#2196F3',
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1976D2',
        marginBottom: 8,
    },
    instructionRow: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    bullet: {
        fontSize: 16,
        color: '#1976D2',
        marginRight: 8,
        fontWeight: 'bold',
    },
    instructionText: {
        fontSize: 14,
        color: '#424242',
        flex: 1,
    },
    indicators: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    indicator: {
        alignItems: 'center',
    },
    indicatorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#E0E0E0',
        marginBottom: 4,
    },
    indicatorActive: {
        backgroundColor: '#2196F3',
    },
    indicatorSuccess: {
        backgroundColor: '#4CAF50',
    },
    indicatorError: {
        backgroundColor: '#F44336',
    },
    indicatorText: {
        fontSize: 11,
        color: '#757575',
    },
    buttonContainer: {
        padding: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    primaryButton: {
        backgroundColor: '#2196F3',
    },
    secondaryButton: {
        backgroundColor: '#757575',
    },
    dangerButton: {
        backgroundColor: '#F44336',
    },
    buttonIcon: {
        fontSize: 24,
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    debugContainer: {
        margin: 16,
        padding: 12,
        backgroundColor: '#FFF3E0',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FFB74D',
    },
    debugLabel: {
        fontSize: 12,
        color: '#E65100',
        fontWeight: 'bold',
        marginBottom: 4,
    },
    debugText: {
        fontSize: 14,
        color: '#F57C00',
        fontFamily: 'monospace',
    },
    errorCard: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    errorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#C62828',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#D32F2F',
        marginBottom: 4,
    },
    errorCode: {
        fontSize: 12,
        color: '#E57373',
        fontFamily: 'monospace',
    },
});