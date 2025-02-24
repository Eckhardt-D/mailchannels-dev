import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import NodeMailer from 'nodemailer'

declare module 'fastify' {
  interface FastifyInstance {
    getNodemailer: () => NodeMailer.Transporter
  }
}

async function init(fastify: FastifyInstance) {
  const nodemailer = NodeMailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false,
    tls: {
      rejectUnauthorized: false,
    },
  })

  fastify.decorate('getNodemailer', () => nodemailer)
}

export const plugin = fp(init, {
  name: 'nodemailer',
  fastify: '5.x.x',
})
