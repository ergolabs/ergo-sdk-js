import test from "ava"
import {InsufficientInputs} from "../errors/insufficientInputs"
import {boxes, boxesWithAssets} from "../samples"
import {RustModule} from "../utils/rustLoader"
import {DefaultBoxSelector} from "./boxSelector"
import {BoxSelection} from "./entities/boxSelection"

test.before(async () => {
  await RustModule.load(true)
})

test("BoxSelector: Insufficient inputs (empty inputs)", async t =>
  t.deepEqual(
    DefaultBoxSelector.select([], {
      nErgs: 100n,
      assets: []
    }),
    new InsufficientInputs("'NErgs' required: 100, given: 0")
  ))

test("BoxSelector: Insufficient inputs", async t => {
  const total = boxes.map(i => i.value).reduce((x, y) => x + y)
  t.deepEqual(
    DefaultBoxSelector.select(boxes, {
      nErgs: total + 1n,
      assets: []
    }),
    new InsufficientInputs(`'NErgs' required: ${total + 1n}, given: ${total}`)
  )
})

test("BoxSelector: Select ERGs", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxes, {
      nErgs: 59999520000n,
      assets: []
    }),
    BoxSelection.make(boxes, {value: 39999180000n, assets: []})
  ))

test("BoxSelector: Select ERGs and assets (+ irrelevant tokens in inputs)", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxesWithAssets, {
      nErgs: 39999500000n,
      assets: [{tokenId: "x", amount: 10n}]
    }),
    BoxSelection.make(boxesWithAssets.slice(0, -1), {
      value: 59999200000n,
      assets: [
        {tokenId: "x", amount: 140n},
        {tokenId: "y", amount: 500n}
      ]
    })
  ))

test("BoxSelector: Select ERGs (Use minimal boxes)", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxes, {
      nErgs: 1000000n,
      assets: []
    }),
    BoxSelection.make([boxes[0]], {value: 59998220000n, assets: []})
  ))

test("BoxSelector: Select tokens (Use minimal boxes)", async t =>
  t.deepEqual(
    DefaultBoxSelector.select(boxesWithAssets, {
      nErgs: 800000n,
      assets: [{tokenId: "z", amount: 50n}]
    }),
    BoxSelection.make([boxesWithAssets[2]], {value: 200000n, assets: []})
  ))
