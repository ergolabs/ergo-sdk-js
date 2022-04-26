export type SigmaRust = typeof import("ergo-lib-wasm-browser")

class Module {
  _ergo?: SigmaRust

  async load(node = false): Promise<SigmaRust> {
    if (this._ergo === undefined) {
      this._ergo = await (node ? import("ergo-lib-wasm-nodejs") : import("ergo-lib-wasm-browser"))
    }
    return this._ergo!
  }

  // Need to expose through a getter to get Flow to detect the type correctly
  get SigmaRust(): SigmaRust {
    return this._ergo!
  }
}

// need this otherwise Wallet's flow type isn't properly exported
export const RustModule: Module = new Module()
