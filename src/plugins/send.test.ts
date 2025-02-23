import type { FastifyInstance } from 'fastify'
import type { SendBody } from './send.js'
import { Buffer } from 'node:buffer'
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
  const validPayload: SendBody = {
    headers: {
      'X-Test': 'test',
    },
    subject: 'Test Subject',
    from: {
      name: 'John Doe',
      email: 'john.doe@test.test',
    },
    content: [
      { type: 'text/plain', value: 'Hello, World!' },
      { type: 'text/plain', value: 'Hello, {{name}}!', template_type: 'mustache' },
      { type: 'text/html', value: '<p>Hello, World!</p>' },
    ],
    personalizations: [
      { to: [{ name: 'Jane Doe', email: 'jane.doe@test.test' }], dynamic_template_data: { name: 'Jane' } },
    ],
    reply_to: {
      name: 'John Doe 2',
      email: 'john.doe2@test.test',
    },
    attachments: [
      {
        filename: 'test.txt',
        content: Buffer.from('Hello, World!').toString('base64'),
      },
    ],
    campaign_id: 'test-campaign',
    dkim_domain: 'test.test',
    dkim_private_key: 'test',
    dkim_selector: 'test',
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking: { enable: true },
    },
  }

  it('responds with 413 if payload is too large', async () => {
    const twentyMB = Buffer.alloc(20 * 1024 * 1024).toString('base64')
    const response = await server.inject({
      method: 'POST',
      path: '/tx/v1/send',
      body: { text: twentyMB },
    })
    expect(response.statusCode).toBe(413)
  })
  
  it('responds with 400 if payload is invalid', async () => {
    const response = await server.inject({
      method: 'POST',
      path: '/tx/v1/send',
      body: {
        ...validPayload,
        content: [],
      }
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toStrictEqual({
      error: 'BadRequestError',
      message: 'Invalid request body at: content => Array must contain at least 1 element(s)',
    })
  })

  it('responds with 400 if payload is invalid', async () => {
    const response = await server.inject({
      method: 'POST',
      path: '/tx/v1/send',
      body: {
        ...validPayload,
        tracking_settings: {
          open_tracking: { enable: true },
          click_tracking: { enable: 1 },
        },
      }
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toStrictEqual({
      error: 'BadRequestError',
      message: 'Invalid request body at: tracking_settings.click_tracking.enable => Expected boolean, received number',
    })
  })

  it('responds with 200 status and message strings if dry-run', async () => {
    const response = await server.inject({
      method: 'POST',
      path: '/tx/v1/send?dry-run',
      body: validPayload,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toStrictEqual({
      data: [
        'Hello, World!',
        'Hello, Jane!',
        '<p>Hello, World!</p>',
      ],
    })
  })

  it('responds with 202 status and message IDs if not dry-run', async () => {
    const response = await server.inject({
      method: 'POST',
      path: '/tx/v1/send',
      body: validPayload,
    })

    expect(response.statusCode).toBe(202)
    expect(response.json()).toStrictEqual({
      request_id: expect.any(String),
      results: [
        {
          index: 0,
          message_id: expect.any(String),
          reason: 'Successfully queued message to be sent',
          status: 'sent',
        },
        {
          index: 1,
          message_id: expect.any(String),
          reason: 'Successfully queued message to be sent',
          status: 'sent',
        },
        {
          index: 2,
          message_id: expect.any(String),
          reason: 'Successfully queued message to be sent',
          status: 'sent',
        }
      ]
    })
  })
})
