declare module "jsdom" {
  export class JSDOM {
    constructor(input?: string | Uint8Array);
    readonly window: Window & typeof globalThis;
  }
}
