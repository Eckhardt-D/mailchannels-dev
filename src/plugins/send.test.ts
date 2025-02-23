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

describe('post /tx/v1/send', () => {
  it('responds with 200 if request was valid', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/tx/v1/send',
    })

    expect(response.statusCode).toBe(200)
  })
})
