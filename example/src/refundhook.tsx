import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import PagSeguro, { HookPayState, usePagRefund, VoidType, type VoidPayData } from 'react-native-pos-pagseguro';


export default function RefundScreen() {
    const [transactionCode, setTransactionCode] = useState('');
    const [transactionId, setTransactionId] = useState('');

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

    const fillWithLastOne = () => {
        try {
            const transaction = PagSeguro.get_last_approved_transaction();
            setTransactionCode(transaction.transaction_code ?? "");
            setTransactionId(transaction.transaction_id ?? "");
        } catch (error) {
            Alert.alert('Aviso', 'Não foi possível obter a última transação aprovada');
        }
    }

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
    };

    const handleAbort = () => {
        Alert.alert(
            'Cancelar Estorno',
            'Deseja realmente cancelar esta operação?',
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
                return '↩️';
        }
    };

    const getStateColor = () => {
        if (isSuccess) return '#4CAF50';
        if (isError) return '#F44336';
        if (isProcessing) return '#FF9800';
        return '#757575';
    };

    const getInstructions = () => {
        switch (state) {
            case HookPayState.WAITING_CARD:
                return {
                    title: 'Aguardando Cartão',
                    steps: [
                        'Insira o mesmo cartão usado na compra',
                        'Ou passe a tarja magnética',
                        'Ou aproxime para leitura contactless'
                    ]
                };
            case HookPayState.ENTER_PASSWORD:
                return {
                    title: 'Digite sua Senha',
                    steps: [
                        'Digite sua senha no terminal',
                        'Use a mesma senha da transação original',
                        'Pressione confirmar'
                    ]
                };
            case HookPayState.AUTHORIZING:
                return {
                    title: 'Autorizando Estorno',
                    steps: [
                        'Aguarde a autorização do estorno',
                        'Isso pode levar alguns segundos',
                        'Não remova o cartão'
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
            default:
                return null;
        }
    };

    const instructions = getInstructions();
    const canSubmit = !isProcessing && !isSuccess && transactionCode.trim() && transactionId.trim();

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Estorno de Pagamento</Text>
                    <Text style={styles.subtitle}>
                        Cancele uma transação já processada
                    </Text>
                </View>

                {!isProcessing && !isSuccess && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>Dados da Transação</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Código da Transação *</Text>
                            <TextInput
                                style={styles.input}
                                value={transactionCode}
                                onChangeText={setTransactionCode}
                                placeholder="Ex: 123456789"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                editable={!isProcessing}
                            />
                            <Text style={styles.inputHint}>
                                Código retornado na aprovação do pagamento
                            </Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>ID da Transação *</Text>
                            <TextInput
                                style={styles.input}
                                value={transactionId}
                                onChangeText={setTransactionId}
                                placeholder="Ex: TRX-20240115-001"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                editable={!isProcessing}
                            />
                            <Text style={styles.inputHint}>
                                ID interno da transação no sistema
                            </Text>
                        </View>
                    </View>
                )}
                {(!isProcessing && !isSuccess && !isError) && (
                    <TouchableOpacity
                        style={[styles.button, styles.primaryButton]}
                        onPress={fillWithLastOne}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.buttonText}>Usar Ultima Transação</Text>
                    </TouchableOpacity>
                )}
                {(isProcessing || isSuccess || isError) && (
                    <View style={[styles.statusCard, { borderLeftColor: getStateColor() }]}>
                        <Text style={styles.statusIcon}>{getStateIcon()}</Text>
                        <Text style={[styles.statusText, { color: getStateColor() }]}>
                            {message || 'Aguardando...'}
                        </Text>

                        {isProcessing && (
                            <ActivityIndicator
                                size="large"
                                color={getStateColor()}
                                style={styles.loader}
                            />
                        )}
                    </View>
                )}
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

                <View style={styles.buttonContainer}>
                    {canSubmit && (
                        <TouchableOpacity
                            style={[styles.button, styles.warningButton]}
                            onPress={handleRefund}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonIcon}>↩️</Text>
                            <Text style={styles.buttonText}>Processar Estorno</Text>
                        </TouchableOpacity>
                    )}

                    {isProcessing && (
                        <TouchableOpacity
                            style={[styles.button, styles.dangerButton]}
                            onPress={handleAbort}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonIcon}>✗</Text>
                            <Text style={styles.buttonText}>Cancelar Operação</Text>
                        </TouchableOpacity>
                    )}

                    {(isSuccess || isError) && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => {
                                reset();
                                setTransactionCode('');
                                setTransactionId('');
                            }}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.buttonIcon}>↻</Text>
                            <Text style={styles.buttonText}>Novo Estorno</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.debugContainer}>
                    <Text style={styles.debugLabel}>Estado Atual:</Text>
                    <Text style={styles.debugText}>{state}</Text>
                </View>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
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
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    formCard: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    inputHint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        fontStyle: 'italic',
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
    primaryButton: {
        backgroundColor: '#6902f0',
        margin: 4,
        marginHorizontal: 15
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
        backgroundColor: '#FFF3E0',
        margin: 16,
        marginTop: 0,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF9800',
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E65100',
        marginBottom: 8,
    },
    instructionRow: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    bullet: {
        fontSize: 16,
        color: '#E65100',
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
        backgroundColor: '#FF9800',
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
    warningButton: {
        backgroundColor: '#FF9800',
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
    warningCard: {
        margin: 16,
        padding: 16,
        backgroundColor: '#FFFDE7',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FDD835',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#F57F17',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#F57F17',
        lineHeight: 20,
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