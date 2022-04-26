import {HexString} from "../types"
import {toHex} from "../utils/hex"
import {RustModule} from "../utils/rustLoader"
import {ErgoTree} from "./ergoTree"

export type ErgoTreeTemplate = HexString

export function treeTemplateFromErgoTree(tree: ErgoTree): ErgoTreeTemplate {
  return toHex(RustModule.SigmaRust.ErgoTree.from_base16_bytes(tree).template_bytes())
}
