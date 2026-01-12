package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.CustomPrinterLayout
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagCustomPrinterLayout

import android.graphics.Color


fun CustomPrinterLayout.toPlugPagCustomPrinterLayout(): PlugPagCustomPrinterLayout {
    return PlugPagCustomPrinterLayout(
        title = title,
        titleColor = title_color,
        confirmTextColor = confirm_text_color,
        cancelTextColor = cancel_text_color,
        windowBackgroundColor = window_background_color,
        buttonBackgroundColor = button_background_color,
        buttonBackgroundColorDisabled = button_background_color_disabled,
        sendSMSTextColor = send_sms_text_color,
        maxTimeShowPopup = max_time_show_popup?.toInt() ?: 0
    )
}

