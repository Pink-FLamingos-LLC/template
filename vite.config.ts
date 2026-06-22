import { sveltekit } from "@sveltejs/kit/vite";
import { sentrySvelteKit } from "@sentry/sveltekit";
import { defineConfig } from "vite-plus";
import openapiPlugin from "sveltekit-openapi-generator";
import path from "node:path";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/lib/server/**/*.ts"],
      exclude: [
        "src/lib/server/__tests__/**",
        "src/lib/server/cloudflare-workers-stub.ts",
        "src/lib/server/db/auth.schema.ts",
        "src/lib/server/db/schema.ts",
        "src/lib/server/db/index.ts",
      ],
    },
  },
  ssr: {
    target: "webworker",
    external: ["cloudflare:workers"],
    resolve: {
      conditions: ["module", "development|production"],
    },
  },
  resolve: {
    alias: {
      "cloudflare:workers": path.resolve("./src/lib/server/cloudflare-workers-stub.ts"),
    },
    conditions: process.env.VITEST ? ["browser"] : undefined,
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: [
    sentrySvelteKit({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      adapter: "cloudflare",
    }),
    openapiPlugin({
      baseSchemasPath: "src/lib/schemas.ts",
      outputPath: "static/openapi.json",
    }),
    sveltekit(),
  ],
});
