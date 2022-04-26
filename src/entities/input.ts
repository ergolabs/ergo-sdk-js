import {BoxId} from "../types"
import {ProverResult} from "./proverResult"

export type Input = {
  readonly boxId: BoxId
  readonly spendingProof: ProverResult
}
