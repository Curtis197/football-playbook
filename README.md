# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Development

| Command | What it does |
|---|---|
| `npm run dev` | Start the app with hot reload |
| `npm test` | Run the whole test suite once (Vitest, plain Node: no browser) |
| `npm run test:watch` | Re-run tests as you edit |
| `npm run typecheck` | Type-check the app, the tests and the configs |
| `npm run lint` | Oxlint |
| `npm run verify` | Lint, type check, tests and the feature-inventory check: everything CI checks except the build |
| `npm run build` | Type check, then production build |

CI (`.github/workflows/ci.yml`) runs lint, type check, tests, the inventory check and the build on every push to `main` and every pull request.

### Tests

Tests sit next to the code they cover (`*.test.ts`, `*.test.tsx`). They cover the pure logic (data validation and
migrations, undo/redo and cloud-merge rules, formation apply/capture, route adaptation, backfield morphing,
geometry and curves, the defensive alignment engine), the built-in plays and formation templates, and a
server-render check of the screen components (read-only View mode, one control per job).

If you change a preset play or formation and a data test fails, it is pointing at a real problem in the data
(a route to a player who is not there, a player off the field, a duplicate name), not at the test.
