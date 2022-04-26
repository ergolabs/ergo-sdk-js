import {Address} from "../../entities/address"
import {DataInput} from "../../entities/dataInput"
import {ErgoBoxCandidate} from "../../entities/ergoBoxCandidate"
import {BoxSelection} from "./boxSelection"

export type TxRequest = {
  readonly inputs: BoxSelection
  readonly dataInputs: DataInput[]
  readonly outputs: ErgoBoxCandidate[]
  readonly changeAddress: Address
  readonly feeNErgs?: bigint
}
