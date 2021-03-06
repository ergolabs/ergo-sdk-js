import {Input} from "./input"
import {ErgoBox, ergoBoxFromProxy, ErgoBoxProxy, ergoBoxToProxy} from "./ergoBox"
import {DataInput} from "./dataInput"
import {TxId} from "../types"

export type ErgoTx = {
  readonly id: TxId
  readonly inputs: Input[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBox[]
  readonly size: number
}

export type ErgoTxProxy = {
  readonly id: TxId
  readonly inputs: Input[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBoxProxy[]
  readonly size: number
}

export function ergoTxFromProxy(proxy: ErgoTxProxy): ErgoTx {
  return {
    ...proxy,
    outputs: proxy.outputs.map(o => ergoBoxFromProxy(o))
  }
}

export function ergoTxToProxy(tx: ErgoTx): ErgoTxProxy {
  return {
    ...tx,
    outputs: tx.outputs.map(o => ergoBoxToProxy(o))
  }
}
