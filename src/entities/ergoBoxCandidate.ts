import {ErgoTree} from "./ergoTree"
import {Registers} from "./registers"
import {TokenAmount, tokenAmountFromProxy, TokenAmountProxy, tokenAmountToProxy} from "./tokenAmount"

export type ErgoBoxCandidate = {
  readonly value: bigint
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly assets: TokenAmount[]
  readonly additionalRegisters: Registers
}

export type ErgoBoxCandidateProxy = {
  readonly value: string
  readonly ergoTree: ErgoTree
  readonly creationHeight: number
  readonly assets: TokenAmountProxy[]
  readonly additionalRegisters: Registers
}

export function ergoBoxCandidateFromProxy(proxy: ErgoBoxCandidateProxy): ErgoBoxCandidate {
  return {
    ...proxy,
    value: BigInt(proxy.value),
    assets: proxy.assets.map(a => tokenAmountFromProxy(a))
  }
}

export function ergoBoxCandidateToProxy(box: ErgoBoxCandidate): ErgoBoxCandidateProxy {
  return {
    ...box,
    value: box.value.toString(),
    assets: box.assets.map(a => tokenAmountToProxy(a))
  }
}
