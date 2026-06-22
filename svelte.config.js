import adapter from "@sveltejs/adapter-cloudflare";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true),
  },
  kit: {
    adapter: adapter(),
    csrf: { trustedOrigins: ["*"] },
    experimental: {
      instrumentation: {
        server: true,
      },
      tracing: {
        server: true,
      },
    },
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["self"],
        "style-src": ["self", "unsafe-inline"],
        "font-src": ["self"],
        "img-src": ["self", "data:"],
      },
    },
    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include, "../drizzle.config.ts"],
      }),
    },
  },
};

export default config;
