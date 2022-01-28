import {BoxSelection} from "./wallet/entities/boxSelection"
import {ErgoBox} from "./entities/ergoBox"
import {ErgoTree, ergoTreeToBytea} from "./entities/ergoTree"
import {TokenAmount} from "./entities/tokenAmount"
import {ErgoBoxCandidate} from "./entities/ergoBoxCandidate"
import {BoxId, TxId} from "./types"
import {TxRequest} from "./wallet/entities/txRequest"
import {NetworkContext} from "./entities/networkContext"
import {RustModule} from "./utils/rustLoader"
import {
  UnsignedTransaction,
  ErgoBoxCandidates,
  Tokens,
  BoxSelection as WasmBoxSelection,
  ErgoBoxCandidate as WasmErgoBoxCandidate,
  ErgoBox as WasmErgoBox,
  ErgoTree as WasmErgoTree,
  Token as WasmToken,
  ErgoStateContext,
  PreHeader,
  ReducedTransaction
} from "ergo-lib-wasm-browser"
import {BlockHeader} from "./entities/blockHeader"

export function txRequestToWasmTransaction(req: TxRequest, ctx: NetworkContext): UnsignedTransaction {
  const inputs = boxSelectionToWasm(req.inputs)
  const outputs = boxCandidatesToWasm(req.outputs)
  const feeAmount = req.feeNErgs || 0n
  const fee = RustModule.SigmaRust.BoxValue.from_i64(RustModule.SigmaRust.I64.from_str(feeAmount.toString()))
  const changeAddr = RustModule.SigmaRust.Address.from_base58(req.changeAddress)
  const minValue = RustModule.SigmaRust.BoxValue.SAFE_USER_MIN()
  const txb = RustModule.SigmaRust.TxBuilder.new(inputs, outputs, ctx.height, fee, changeAddr, minValue)
  return txb.build()
}

export function blockHeadersToErgoStateContext(blockHeaders: BlockHeader[]): ErgoStateContext {
  const block_headers = RustModule.SigmaRust.BlockHeaders.from_json(blockHeaders.slice(0, 10))
  const pre_header = PreHeader.from_block_header(block_headers.get(0))
  return new RustModule.SigmaRust.ErgoStateContext(pre_header, block_headers)
}

export function txRequestToWasmReducedTx(
  req: TxRequest,
  ergoStateCtx: ErgoStateContext,
  ctx: NetworkContext
): ReducedTransaction {
  const unsignedTx = txRequestToWasmTransaction(req, ctx)
  const unspent_boxes = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(req.inputs.inputs)
  const tx_data_inputs = RustModule.SigmaRust.ErgoBoxes.from_boxes_json(req.dataInputs)
  return RustModule.SigmaRust.ReducedTransaction.from_unsigned_tx(
    unsignedTx,
    unspent_boxes,
    tx_data_inputs,
    ergoStateCtx
  )
}

export function boxSelectionToWasm(inputs: BoxSelection): WasmBoxSelection {
  const boxes = new RustModule.SigmaRust.ErgoBoxes(boxToWasm(inputs.inputs[0]))
  const tokens = new RustModule.SigmaRust.Tokens()
  const changeList = new RustModule.SigmaRust.ErgoBoxAssetsDataList()
  if (inputs.change) {
    inputs.change.assets.forEach((a, _ix, _xs) => {
      const t = new RustModule.SigmaRust.Token(
        RustModule.SigmaRust.TokenId.from_str(a.tokenId),
        RustModule.SigmaRust.TokenAmount.from_i64(RustModule.SigmaRust.I64.from_str(a.amount.toString()))
      )
      tokens.add(t)
    })
    const change = new RustModule.SigmaRust.ErgoBoxAssetsData(
      RustModule.SigmaRust.BoxValue.from_i64(
        RustModule.SigmaRust.I64.from_str(inputs.change.value.toString())
      ),
      tokens
    )
    for (const box of inputs.inputs.slice(1)) boxes.add(boxToWasm(box))
    changeList.add(change)
  }
  return new RustModule.SigmaRust.BoxSelection(boxes, changeList)
}

export function boxCandidatesToWasm(boxes: ErgoBoxCandidate[]): ErgoBoxCandidates {
  const candidates = RustModule.SigmaRust.ErgoBoxCandidates.empty()
  for (const box of boxes) candidates.add(boxCandidateToWasm(box))
  return candidates
}

export function boxCandidateToWasm(box: ErgoBoxCandidate): WasmErgoBoxCandidate {
  const value = RustModule.SigmaRust.BoxValue.from_i64(
    RustModule.SigmaRust.I64.from_str(box.value.toString())
  )
  const contract = RustModule.SigmaRust.Contract.pay_to_address(
    RustModule.SigmaRust.Address.recreate_from_ergo_tree(ergoTreeToWasm(box.ergoTree))
  )
  const builder = new RustModule.SigmaRust.ErgoBoxCandidateBuilder(value, contract, box.creationHeight)
  for (const token of box.assets) {
    const t = tokenToWasm(token)
    builder.add_token(t.id(), t.amount())
  }
  for (const [id, value] of Object.entries(box.additionalRegisters)) {
    const constant = RustModule.SigmaRust.Constant.decode_from_base16(value)
    builder.set_register_value(registerIdToWasm(id), constant)
  }
  return builder.build()
}

export function computeBoxId(box: ErgoBoxCandidate, txId: TxId, idx: number): BoxId {
  return boxCandidateToWasmBox(box, txId, idx).box_id().to_str()
}

export function boxCandidateToWasmBox(box: ErgoBoxCandidate, txId: TxId, idx: number): WasmErgoBox {
  const value = RustModule.SigmaRust.BoxValue.from_i64(
    RustModule.SigmaRust.I64.from_str(box.value.toString())
  )
  const contract = RustModule.SigmaRust.Contract.pay_to_address(
    RustModule.SigmaRust.Address.recreate_from_ergo_tree(ergoTreeToWasm(box.ergoTree))
  )
  const transactionId = RustModule.SigmaRust.TxId.from_str(txId)
  const tokens = tokensToWasm(box.assets)
  return new RustModule.SigmaRust.ErgoBox(value, box.creationHeight, contract, transactionId, idx, tokens)
}

export function registerIdToWasm(id: string): number {
  return Number(id[1])
}

export function boxToWasm(box: ErgoBox): WasmErgoBox {
  const value = RustModule.SigmaRust.BoxValue.from_i64(
    RustModule.SigmaRust.I64.from_str(box.value.toString())
  )
  const contract = RustModule.SigmaRust.Contract.pay_to_address(
    RustModule.SigmaRust.Address.recreate_from_ergo_tree(ergoTreeToWasm(box.ergoTree))
  )
  const txId = RustModule.SigmaRust.TxId.from_str(box.transactionId)
  const tokens = tokensToWasm(box.assets)
  return new RustModule.SigmaRust.ErgoBox(value, box.creationHeight, contract, txId, box.index, tokens)
}

export function ergoTreeToWasm(tree: ErgoTree): WasmErgoTree {
  return RustModule.SigmaRust.ErgoTree.from_bytes(ergoTreeToBytea(tree))
}

export function tokenToWasm(token: TokenAmount): WasmToken {
  const id = RustModule.SigmaRust.TokenId.from_str(token.tokenId)
  const amount = RustModule.SigmaRust.TokenAmount.from_i64(
    RustModule.SigmaRust.I64.from_str(token.amount.toString())
  )
  return new RustModule.SigmaRust.Token(id, amount)
}

export function tokensToWasm(tokens: TokenAmount[]): Tokens {
  const bf = new RustModule.SigmaRust.Tokens()
  for (const t of tokens) bf.add(tokenToWasm(t))
  return bf
}
