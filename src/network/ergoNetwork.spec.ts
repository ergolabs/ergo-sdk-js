import test from "ava"
import {RustModule} from "../utils/rustLoader"
import {Explorer} from "./ergoNetwork"

test.before(async () => {
  await RustModule.load(true)
})

const explorer = new Explorer("https://api.ergoplatform.com")
const defaultPaging = {offset: 0, limit: 10}

test("ergoNetwork getUnspentByErgoTree", async t => {
  await t.notThrowsAsync(
    explorer.getUnspentByErgoTree(
      "0008cd028ed8375cdff4f9e686f95a76ee3a14ab4536b417c49d6de4a7c6c635bf1ec8aa",
      defaultPaging
    )
  )
})

test("ergoNetwork getNetworkContext", async t => {
  await t.notThrowsAsync(explorer.getNetworkContext())
})

test("ergoNetwork getTokens", async t => {
  await t.notThrowsAsync(explorer.getTokens(defaultPaging))
})

test("ergoNetwork searchUnspentBoxesByTokensUnion", async t => {
  const req = {
    ergoTreeTemplateHash: "4b0c28331ab1ca67fc9f3de3e6661d6a80a1da38a9dae86dfa7eac1b9fc699a1",
    assets: ["7f14228a5fd5b5c5d74bfbced3491916e2dc305106dd043f78b65b4cced9c2b9"]
  }
  await t.notThrowsAsync(explorer.searchUnspentBoxesByTokensUnion(req, defaultPaging))
})

test("ergoNetwork getBalanceByAddress", async t => {
  await t.notThrowsAsync(explorer.getBalanceByAddress("9iKFBBrryPhBYVGDKHuZQW7SuLfuTdUJtTPzecbQ5pQQzD4VykC"))
})
