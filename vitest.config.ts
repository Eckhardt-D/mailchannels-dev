import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globalSetup: [
      './fixtures/global-setup.ts',
    ],
  },
})
