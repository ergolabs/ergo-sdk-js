import * as R from "ramda"
import {ErgoBox} from "../entities/ergoBox"
import {TokenAmount} from "../entities/tokenAmount"
import {InsufficientInputs} from "../errors/insufficientInputs"
import {TokenId} from "../types"
import {BoxSelection} from "./entities/boxSelection"
import {OverallAmount} from "./entities/overallAmount"

export interface BoxSelector {
  /** Selects inputs to satisfy target balance and tokens.
   */
  select(inputs: ErgoBox[], target: OverallAmount): BoxSelection | InsufficientInputs
}

class DefaultBoxSelectorImpl implements BoxSelector {
  select(inputs: ErgoBox[], target: OverallAmount): BoxSelection | InsufficientInputs {
    const sufficientInputs: ErgoBox[] = []
    let totalNErgs = 0n
    const totalAssets = new Map<TokenId, bigint>()
    const targetAssetIds = target.assets.map(a => a.tokenId)
    const byAssetEntries = R.descend((bx: ErgoBox) => {
      let entries = 0
      bx.assets.forEach(a => {
        if (targetAssetIds.includes(a.tokenId)) entries++
      })
      return entries
    })
    const sortedByAssetEntries = R.sortWith([byAssetEntries])
    const sortedInputs = sortedByAssetEntries(inputs)
    for (const i of sortedInputs) {
      totalNErgs += i.value
      for (const t of i.assets) {
        const acc = totalAssets.get(t.tokenId) || 0n
        totalAssets.set(t.tokenId, t.amount + acc)
      }
      sufficientInputs.push(i)
      const sufficientErgs = totalNErgs >= target.nErgs
      const sufficientAssets = () =>
        target.assets
          .map(ta => (totalAssets.get(ta.tokenId) || 0n) >= ta.amount)
          .reduce((f0, f1) => f0 && f1, true)
      if (sufficientErgs && sufficientAssets()) break
    }
    const deltaNErgs = totalNErgs - target.nErgs
    const deltaAssets: TokenAmount[] = []
    for (const [id, totalAmt] of totalAssets) {
      const targetAmt = target.assets.find(a => a.tokenId === id)?.amount || 0n
      deltaAssets.push({tokenId: id, amount: totalAmt - targetAmt})
    }
    if (deltaNErgs < 0)
      return new InsufficientInputs(`'NErgs' required: ${target.nErgs}, given: ${totalNErgs}`)
    else if (!deltaAssets.every(a => a.amount >= 0)) {
      const failedAsset = deltaAssets.find(a => a.amount < 0)!
      const assetName = failedAsset.name || failedAsset.tokenId
      const givenAmount = totalAssets.get(failedAsset.tokenId) || 0n
      const requiredAmount = givenAmount - failedAsset.amount
      return new InsufficientInputs(`'${assetName}' required: ${requiredAmount}, given: ${givenAmount}`)
    } else {
      const changeRequired = !(deltaNErgs === 0n && deltaAssets.every(a => a.amount === 0n))
      const change = changeRequired
        ? {
            value: deltaNErgs,
            assets: deltaAssets.filter(a => a.amount > 0)
          }
        : undefined
      return BoxSelection.make(sufficientInputs, change) || new InsufficientInputs("Inputs are empty")
    }
  }
}

export const DefaultBoxSelector = new DefaultBoxSelectorImpl()
