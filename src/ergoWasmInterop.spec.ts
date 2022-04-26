import test from "ava"
import * as wasm from "./ergoWasmInterop"
import {boxes} from "./samples"
import {RustModule} from "./utils/rustLoader"

test.before(async () => {
  await RustModule.load(true)
})

test("ErgoBoxToWasm conversion", t => {
  for (const b of boxes) {
    t.log(wasm.boxToWasm(b))
    t.notThrows(() => wasm.boxToWasm(b))
  }
})

test("ErgoBoxCandidateToWasmBox conversion", t => {
  const dummyTxId = "026fb3ec6303a7b64fc947df86b84b3ef78c6693c1990c52ea56037c50b674c0"
  for (const b of boxes) t.notThrows(() => wasm.boxCandidateToWasmBox(b, dummyTxId, 0))
})
