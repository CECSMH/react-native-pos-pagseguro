import { NitroModules } from 'react-native-nitro-modules';
import type { PosPagseguro } from './PosPagseguro.nitro';
import { InstallmentTypes, PaymentTypes } from './types/payments';
import type { PaymentData } from './types/payments';

const PosPagseguroHybridObject =
  NitroModules.createHybridObject<PosPagseguro>('PosPagseguro');

export function multiply(a: number, b: number): number {
  return PosPagseguroHybridObject.multiply(a, b);
}


export type {
  PaymentData
}

export {
  PaymentTypes,
  InstallmentTypes,
}