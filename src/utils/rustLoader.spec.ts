import test from "ava"
import {RustModule} from "./rustLoader"

test("rustLoader", async t => {
  t.falsy(RustModule.SigmaRust)
  await t.notThrowsAsync(() => RustModule.load(true))
  t.truthy(RustModule.SigmaRust)
})
