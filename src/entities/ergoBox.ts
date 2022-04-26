import {BoxId, TxId} from "../types"
import {ErgoTree} from "./ergoTree"
import {Registers} from "./registers"
import {TokenAmount, tokenAmountFromProxy, TokenAmountProxy, tokenAmountToProxy} from "./tokenAmount"

export type ErgoBox = {
  readonly boxId: BoxId
  readonly transactionId: TxId
  readonly index: number
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly value: bigint
  readonly assets: TokenAmount[]
  readonly additionalRegisters: Registers
}

export type ErgoBoxProxy = {
  readonly boxId: BoxId
  readonly transactionId: TxId
  readonly index: number
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly value: string
  readonly assets: TokenAmountProxy[]
  readonly additionalRegisters: Registers
}

export function ergoBoxFromProxy(proxy: ErgoBoxProxy): ErgoBox {
  return {
    ...proxy,
    value: BigInt(proxy.value),
    assets: proxy.assets.map(t => tokenAmountFromProxy(t))
  }
}

export function ergoBoxToProxy(box: ErgoBox): ErgoBoxProxy {
  return {
    ...box,
    value: box.value.toString(),
    assets: box.assets.map(t => tokenAmountToProxy(t))
  }
}
