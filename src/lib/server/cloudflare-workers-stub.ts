export class DurableObject {
  ctx: unknown;
  env: unknown;
  constructor(ctx: unknown, env: unknown) {
    this.ctx = ctx;
    this.env = env;
  }
}

export class RpcTarget {}

export const env = {};

// biome-ignore lint/suspicious/noExplicitAny: stub export
export const exports: any = {};
