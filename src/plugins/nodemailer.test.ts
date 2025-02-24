import type { FastifyInstance } from 'fastify'
import Fastify from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { plugin } from './nodemailer.js'

let server: FastifyInstance

beforeAll(async () => {
  server = Fastify()
  await server.register(plugin)
})

afterAll(async () => {
  await server.close()
})

describe('nodemailer', () => {
  it('should have a getNodemailer method', () => {
    expect(server.getNodemailer).toBeDefined()
  })

  it('should return a nodemailer transporter', () => {
    const transporter = server.getNodemailer()
    expect(transporter).toBeDefined()
  })
})
