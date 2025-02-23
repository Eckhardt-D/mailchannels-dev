import type { FastifyInstance } from 'fastify'
import HttpProxy from '@fastify/http-proxy'
import fp from 'fastify-plugin'
import Maildev from 'maildev'

async function init(fastify: FastifyInstance) {
  const maildev = new Maildev({
    // @ts-expect-error DefinitelyTyped is wrong about this not
    // being a valid option, see https://github.com/maildev/maildev/blob/master/docs/api.md
    basePathname: '/mails',
  })

  maildev.listen((err) => {
    if (err) {
      throw new Error(`Failed to start maildev: ${err.message}`)
    }
  })

  fastify.addHook('onClose', () => {
    maildev.close()
  })

  await fastify.register(HttpProxy, {
    upstream: `http://localhost:1080/mails`,
    prefix: '/mails',
  })
}

export const plugin = fp(init, {
  name: 'maildev',
  fastify: '5.x.x',
})
