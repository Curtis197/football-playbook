import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Tests cover the pure logic (data model, migrations, geometry, formations, history) plus a server-render
// smoke test of the screen components. They run in plain Node: no browser, no DOM.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    unstubGlobals: true
  }
})
