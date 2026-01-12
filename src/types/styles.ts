export type StyleData = {
  /** Cor do texto do cabeçalho */
  head_text_color?: string;
  /** Cor de fundo do cabeçalho */
  head_background_color?: string;
  /** Cor geral do texto do conteúdo */
  content_text_color?: string;
  /** Cor do texto para o primeiro valor do conteúdo */
  content_text_value1_color?: string;
  /** Cor do texto para o segundo valor do conteúdo */
  content_text_value2_color?: string;
  /** Cor do texto do botão positivo (confirmar/OK) */
  positive_button_text_color?: string;
  /** Cor de fundo do botão positivo (confirmar/OK) */
  positive_button_background?: string;
  /** Cor do texto do botão negativo (cancelar) */
  negative_button_text_color?: string;
  /** Cor de fundo do botão negativo (cancelar) */
  negative_button_background?: string;
  /** Cor de fundo de botões genéricos */
  generic_button_background?: string;
  /** Cor do texto de botões genéricos */
  generic_button_text_color?: string;
  /** Cor de fundo do campo de entrada de SMS */
  generic_sms_edit_text_background?: string;
  /** Cor do texto do campo de entrada de SMS */
  generic_sms_edit_text_text_color?: string;
  /** Cor das linhas divisórias (separadores) */
  line_color?: string;
};

export type CustomPrinterLayout = {
  /** Título apresentado na tela */
  title?: string;
  /** Cor do texto do título (ex: "#000000") */
  title_color?: string;
  /** Cor do texto do botão de confirmação */
  confirm_text_color?: string;
  /** Cor do texto do botão de cancelamento */
  cancel_text_color?: string;
  /** Cor de fundo da janela/popup */
  window_background_color?: string;
  /** Cor de fundo dos botões */
  button_background_color?: string;
  /** Cor de fundo dos botões quando desabilitados */
  button_background_color_disabled?: string;
  /** Cor do texto da sugestão de envio de SMS */
  send_sms_text_color?: string;
  /** Tempo máximo de exibição do popup (em segundos) */
  max_time_show_popup?: number; 
};

