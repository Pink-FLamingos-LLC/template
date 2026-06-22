import { DurableObject } from "cloudflare:workers";

interface Env {
  DB: D1Database;
}

export class StateManager extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/increment") {
      let count: number = (await this.ctx.storage.get("count")) || 0;
      count++;
      await this.ctx.storage.put("count", count);
      return new Response(JSON.stringify({ count }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const count: number = (await this.ctx.storage.get("count")) || 0;
    return new Response(JSON.stringify({ count }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
