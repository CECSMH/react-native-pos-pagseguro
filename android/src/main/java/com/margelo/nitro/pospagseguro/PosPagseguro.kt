package com.margelo.nitro.pospagseguro
  
import com.facebook.proguard.annotations.DoNotStrip

@DoNotStrip
class PosPagseguro : HybridPosPagseguroSpec() {
  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }
}
