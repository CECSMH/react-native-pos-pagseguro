import { NitroModules } from 'react-native-nitro-modules';
import type { PosPagseguro } from './PosPagseguro.nitro';

const PosPagseguroHybridObject =
  NitroModules.createHybridObject<PosPagseguro>('PosPagseguro');

export function multiply(a: number, b: number): number {
  return PosPagseguroHybridObject.multiply(a, b);
}
