---description: Run code-simplifier, svelte-autofixer, vp check, and vp build on pending changes---
Here are the pending changes:

!`git diff`

!`git diff --cached`

Please run these steps on the pending changes above:

1. **code-simplifier**: Load the code-simplifier skill and apply it to simplify and clean up the changed code while preserving behavior.
2. **svelte-autofixer**: For any changed `.svelte` files, run the svelte-autofixer tool from the Svelte MCP server to check for issues and apply fixes.
3. **vp check**: Run `vp check` to format, lint, type-check, and test the changes.
4. **vp build**: Run `vp build` to verify the project builds successfully. Fix any errors or warnings found.

Fix any issues found in each step before proceeding to the next.
