import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build } from '../server.js'

let server: FastifyInstance

beforeAll(async () => {
  server = await build()
  await server.ready()
})

afterAll(async () => {
  await server.close()
})

describe('get /mails', () => {
  it('returns the HTML interface', async () => {
    const response = await server.inject({
      method: 'GET',
      path: '/mails',
    })
    expect(response.statusCode).toBe(301)
    expect(response.body).toContain('<html')
  })
})
