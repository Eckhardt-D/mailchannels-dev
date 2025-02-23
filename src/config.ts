import { env } from 'node:process'
import { z } from 'zod'

const configSchema = z.object({
  apiKey: z.string()
    .describe('An optional API key to make Auth actually check it in requests')
    .optional(),
})

export function configure() {
  return configSchema.parse({
    apiKey: env.API_KEY,
  })
}
