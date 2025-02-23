import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build } from './server.js'

let server: FastifyInstance

beforeAll(async () => {
  process.env.API_KEY = 'test-key'
  server = await build()
})

afterAll(async () => {
  delete process.env.API_KEY
  await server.close()
})

describe('auth', () => {
  it('returns 200', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
  })

  it('blocks if no key', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
    })

    expect(response.statusCode).toBe(401)
  })

  it('allows if key', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/',
      headers: {
        'x-api-key': 'test-key',
      },
    })

    expect(response.statusCode).toBe(200)
  })
})
