import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { z } from 'zod'

const authPluginOptionsSchema = z.object({
  keys: z.array(z.string()),
})

export type AuthPluginOptions = z.input<typeof authPluginOptionsSchema>

const init: FastifyPluginAsync<AuthPluginOptions> = async function (fastify, opts) {
  const params = authPluginOptionsSchema.parse(opts)

  fastify.addHook('onRequest', async (request) => {
    const apiHeader = request.headers['x-api-key']
      || request.headers['X-Api-Key']

    if (!apiHeader || typeof apiHeader !== 'string' || !params.keys.includes(apiHeader)) {
      throw fastify.httpErrors.unauthorized()
    }
  })
}

export const plugin = fp(init, {
  name: 'auth',
  fastify: '5.x.x',
  dependencies: ['@fastify/sensible'],
})
