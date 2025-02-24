import type { FastifyInstance } from 'fastify'
import HttpProxy from '@fastify/http-proxy'
import fp from 'fastify-plugin'

async function init(fastify: FastifyInstance) {
  await fastify.register(HttpProxy, {
    upstream: `http://localhost:1080/mails`,
    prefix: '/mails',
    websocket: true,
  })
}

export const plugin = fp(init, {
  name: 'maildev',
  fastify: '5.x.x',
})
