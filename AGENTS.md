<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Cloudflare Binding Type Definitions

> [!IMPORTANT]
> To generate or update Cloudflare Worker binding type declarations for SvelteKit (in `worker-configuration.d.ts` or `src/app.d.ts`), run the `wrangler types` command (e.g. `pnpm wrangler types` or `npx wrangler types`). Do NOT manually import `@cloudflare/workers-types` or add it to the tsconfig.json types array directly.

# Using Phosphor Icons

This project uses `phosphor-svelte` for icons. Browse icons at https://phosphoricons.com.

```svelte
<script lang="ts">
  import CubeIcon from 'phosphor-svelte/lib/CubeIcon';
</script>

<CubeIcon color="#AE2983" weight="fill" size={32} />
```

Props: `color`, `size`, `weight` (thin/light/regular/bold/fill/duotone), `mirrored`.

Use default imports from `phosphor-svelte/lib/<IconName>Icon` for faster compiling. Named imports from `phosphor-svelte` work too but are slower.
