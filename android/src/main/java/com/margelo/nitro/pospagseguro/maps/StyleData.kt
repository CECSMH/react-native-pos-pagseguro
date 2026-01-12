package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.StyleData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagStyleData

import android.graphics.Color

fun StyleData.toPlugPagStyleData(): PlugPagStyleData {
    return PlugPagStyleData(
        headTextColor = head_text_color?.let { parseColor(it) },
        headBackgroundColor = head_background_color?.let { parseColor(it) },
        contentTextColor = content_text_color?.let { parseColor(it) },
        contentTextValue1Color = content_text_value1_color?.let { parseColor(it) },
        contentTextValue2Color = content_text_value2_color?.let { parseColor(it) },
        positiveButtonTextColor = positive_button_text_color?.let { parseColor(it) },
        positiveButtonBackground = positive_button_background?.let { parseColor(it) },
        negativeButtonTextColor = negative_button_text_color?.let { parseColor(it) },
        negativeButtonBackground = negative_button_background?.let { parseColor(it) },
        genericButtonBackground = generic_button_background?.let { parseColor(it) },
        genericButtonTextColor = generic_button_text_color?.let { parseColor(it) },
        genericSmsEditTextBackground = generic_sms_edit_text_background?.let { parseColor(it) },
        genericSmsEditTextTextColor = generic_sms_edit_text_text_color?.let { parseColor(it) },
        lineColor = line_color?.let { parseColor(it) }
    )
}

private fun parseColor(colorString: String): Int? {
    return try {
        Color.parseColor(colorString)
    } catch (e: IllegalArgumentException) {
        null 
    }
}
