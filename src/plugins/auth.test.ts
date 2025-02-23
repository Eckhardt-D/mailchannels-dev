import type { FastifyInstance } from 'fastify'
import Sensible from '@fastify/sensible'
import Fastify from 'fastify'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { plugin } from './auth.js'

let server: FastifyInstance

beforeEach(async () => {
  server = Fastify()
})

afterEach(async () => {
  await server.close()
})

describe('dependencies', () => {
  it('requires sensible', async () => {
    await expect(server.register(plugin, { keys: [] })).rejects.toThrow(
      'The dependency \'@fastify/sensible\' of plugin \'auth\' is not registered',
    )
  })
})

describe('plugin:auth', () => {
  beforeEach(async () => {
    await server.register(Sensible)
  })

  it('throws if enabled and invalid keys', async () => {
    await expect(
      server.register(plugin, {
        // @ts-expect-error invalid keys
        keys: [123],
      }),
    ).rejects.toThrow()
  })

  it('blocks even if no keys present', async () => {
    server.register(plugin, {
      keys: [],
    })

    server.get('/', () => 'Hello, World')

    const response = await server.inject({
      method: 'GET',
      path: '/',
    })

    expect(response.statusCode).toBe(401)
  })

  it('blocks if invalid key', async () => {
    server.register(plugin, {
      keys: ['valid-key'],
    })

    server.get('/', () => 'Hello, World')

    const response = await server.inject({
      method: 'GET',
      path: '/',
      headers: {
        'x-api-key': 'invalid-key',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('allows if valid key', async () => {
    server.register(plugin, {
      keys: ['valid-key'],
    })

    server.get('/', () => 'Hello, World')

    const response = await server.inject({
      method: 'GET',
      path: '/',
      headers: {
        'x-api-key': 'valid-key',
      },
    })

    expect(response.statusCode).toBe(200)
  })
})
