import {DataInput} from "./dataInput"
import {
  ErgoBoxCandidate,
  ergoBoxCandidateFromProxy,
  ErgoBoxCandidateProxy,
  ergoBoxCandidateToProxy
} from "./ergoBoxCandidate"
import {
  UnsignedInput,
  unsignedInputFromProxy,
  UnsignedInputProxy,
  unsignedInputToProxy
} from "./unsignedInput"

export type UnsignedErgoTx = {
  readonly inputs: UnsignedInput[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBoxCandidate[]
}

export type UnsignedErgoTxProxy = {
  readonly inputs: UnsignedInputProxy[]
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBoxCandidateProxy[]
}

export function unsignedErgoTxFromProxy(proxy: UnsignedErgoTxProxy): UnsignedErgoTx {
  return {
    ...proxy,
    inputs: proxy.inputs.map(i => unsignedInputFromProxy(i)),
    outputs: proxy.outputs.map(o => ergoBoxCandidateFromProxy(o))
  }
}

export function unsignedErgoTxToProxy(tx: UnsignedErgoTx): UnsignedErgoTxProxy {
  return {
    ...tx,
    inputs: tx.inputs.map(i => unsignedInputToProxy(i)),
    outputs: tx.outputs.map(o => ergoBoxCandidateToProxy(o))
  }
}
