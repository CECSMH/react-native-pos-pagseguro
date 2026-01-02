package com.margelo.nitro.pospagseguro.maps

import com.margelo.nitro.pospagseguro.UserData
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagUserDataResult

fun PlugPagUserDataResult.toUserData(): UserData {
    return UserData(
        address = this.address,
        city = this.city,
        cnpj_cpf = this.cnpjCpf,
        address_complement = this.addressComplement,
        company_name = this.companyName,
        nick_name = this.userNickName,
        address_state = this.addressState,
        email = this.email
    )
}
