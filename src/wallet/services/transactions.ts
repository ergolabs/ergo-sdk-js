import {Address} from "../../entities/address"
import {ergoTreeFromAddress} from "../../entities/ergoTree"
import {ErgoTx} from "../../entities/ergoTx"
import {TransactionContext} from "../entities/transactionContext"
import {Prover} from "../prover"
import {TxAssembler} from "../txAssembler"

export interface Transactions {
  simple(recipient: Address, ctx: TransactionContext): Promise<ErgoTx>
}

export class DefaultTransactions implements Transactions {
  constructor(public readonly prover: Prover, public readonly txAsm: TxAssembler) {}

  async simple(recipient: Address, ctx: TransactionContext): Promise<ErgoTx> {
    const outputGranted = ctx.inputs.totalOutputWithoutChange
    const out = {
      value: outputGranted.nErgs - ctx.feeNErgs,
      ergoTree: ergoTreeFromAddress(recipient),
      creationHeight: ctx.network.height,
      assets: outputGranted.assets,
      additionalRegisters: {}
    }
    const req = {
      inputs: ctx.inputs,
      dataInputs: [],
      outputs: [out],
      changeAddress: ctx.changeAddress,
      feeNErgs: ctx.feeNErgs
    }
    return this.prover.sign(this.txAsm.assemble(req, ctx.network))
  }
}
