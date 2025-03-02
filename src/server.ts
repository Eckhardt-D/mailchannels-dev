import { stdout } from 'node:process'
import FastifySensible from '@fastify/sensible'
import Fastify from 'fastify'

import { configure } from './config.js'
import { plugin as authPlugin } from './plugins/auth.js'
import { plugin as maildevPlugin } from './plugins/maildev.js'
import { plugin as nodeMailerPlugin } from './plugins/nodemailer.js'

import SendHandler from './plugins/send.js'

export async function build() {
  const config = configure()

  const server = Fastify({
    logger: stdout.isTTY
      ? {
          transport: {
            target: 'pino-pretty',
          },
        }
      : true,
  })

  server.setErrorHandler((error, _, reply) => {
    if (error instanceof Fastify.errorCodes.FST_ERR_CTP_BODY_TOO_LARGE) {
      return reply.code(413).send()
    }

    return reply.status(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
    })
  })

  server.register(FastifySensible)

  // Unautheticated routes
  server.get('/health', async () => ({ status: 'ok' }))

  server.register(async (instance) => {
    // Only register auth if a key
    // is provided in `env.API_KEY`
    if (config.apiKey !== undefined) {
      await instance.register(authPlugin, {
        keys: [config.apiKey],
      })
    }

    const prefix = '/tx/v1'

    // Authenticated routes
    await instance.register(nodeMailerPlugin)
    await instance.register(maildevPlugin)
    await instance.register(SendHandler, { prefix })

    instance.get('*', () =>
      'Please see documentation at https://docs.mailchannels.net')
  })

  return server
}
