package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.SubAcquirer
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagSubAcquirerResult

fun PlugPagSubAcquirerResult.toSubAcquirer(): SubAcquirer {
    return SubAcquirer(
        name = this.name,
        address = this.address,
        city = this.city,
        uf = this.uf,
        country = this.country,
        zip_code = this.zipCode,
        mcc = this.mcc,
        cnpj_cpf = this.cnpjCpf,
        doc_type = this.docType,
        telephone = this.telephone,
        full_name = this.fullName,
        merchant_id = this.merchantId
    )
}


