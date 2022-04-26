import {ErgoBox} from "../../entities/ergoBox"
import {TokenAmount} from "../../entities/tokenAmount"
import {UnsignedInput} from "../../entities/unsignedInput"
import {TokenId} from "../../types"
import {ChangeBox} from "./changeBox"
import {OverallAmount} from "./overallAmount"

export class BoxSelection {
  private constructor(public readonly inputs: ErgoBox[], public readonly change?: ChangeBox) {}

  static make(inputs: ErgoBox[], change?: ChangeBox): BoxSelection | undefined {
    return inputs.length > 0 ? new BoxSelection(inputs, change) : undefined
  }

  static safe(head: ErgoBox, others?: ErgoBox[], change?: ChangeBox): BoxSelection {
    return new BoxSelection([head].concat(others || []), change)
  }

  get newTokenId(): TokenId {
    return this.inputs[0].boxId
  }

  get unsignedInputs(): UnsignedInput[] {
    return this.inputs.map(bx => ({...bx, extension: {}}))
  }

  /** Amounts of all kinds of tokens with change excluded.
   */
  get totalOutputWithoutChange(): OverallAmount {
    const nErgsIn = this.inputs.map(bx => bx.value).reduce((x, y) => x + y)
    const nErgsChange = this.change?.value || 0n
    const assetsChange = this.change?.assets || []
    const nErgs = nErgsIn - nErgsChange
    const tokensAgg = new Map<TokenId, bigint>()
    for (const t of this.inputs.flatMap(bx => bx.assets)) {
      const acc = tokensAgg.get(t.tokenId) || 0n
      tokensAgg.set(t.tokenId, t.amount + acc)
    }
    for (const a of assetsChange) {
      const amountIn = tokensAgg.get(a.tokenId)
      if (amountIn) tokensAgg.set(a.tokenId, amountIn - a.amount)
    }
    const tokens: TokenAmount[] = []
    tokensAgg.forEach((amount, tokenId) => (amount > 0 ? tokens.push({tokenId, amount}) : undefined))
    return {nErgs, assets: tokens}
  }

  addInput(input: ErgoBox): BoxSelection {
    return BoxSelection.safe(input, this.inputs, this.change)
  }
}
