import * as bs58 from "bs58"
import {Base58String} from "../types"

export enum Network {
  Mainnet = 0 << 4,
  Testnet = 1 << 4
}

export enum AddressKind {
  P2PK = 1,
  P2SH = 2,
  P2S = 3
}

export type Address = Base58String

export function kindOfAddress(address: Address): AddressKind {
  return bs58.decode(address)[0] & 0xf
}
