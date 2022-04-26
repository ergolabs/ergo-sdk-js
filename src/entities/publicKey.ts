import * as bs58 from "bs58"
import {HexString} from "../types"
import {Address, AddressKind, kindOfAddress} from "./address"

export type PublicKey = HexString

/** Construct `PublicKey` from address
 *  @return - `PublicKey` in case given address is P2PK, `undefined` otherwise.
 */
export function publicKeyFromAddress(address: Address): PublicKey | undefined {
  const addressRaw = bs58.decode(address)
  const pk = addressRaw.slice(1, 34).toString("hex")
  return kindOfAddress(address) === AddressKind.P2PK ? pk : undefined
}
