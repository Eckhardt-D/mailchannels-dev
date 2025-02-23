// This plugin does not use fastify plugin since it's purpose is to
// register route handlers and not shared functionality.

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

interface SendQuery {
  'dry-run'?: boolean
}

const attachmentSchema = z.object({
  type: z.string().optional().describe('The MIME type of the attachment'),
  content: z.string().base64().describe('The base64 encoded content of the attachment'),
  filename: z.string().describe('The filename of the attachment'),
})

export type Attachment = z.infer<typeof attachmentSchema>

const contentSchema = z.object({
  template_type: z.enum(['mustache']).optional().describe('The template type of the content'),
  type: z.string().describe('The MIME type of the content'),
  value: z.string().describe('The value of the content'),
})

const authorSchema = z.object({
  name: z.string().optional().describe('The name of the author'),
  email: z.string().email().describe('The email of the author'),
})

type JsonSchema =
  | number
  | string
  | boolean
  | JsonSchema[]
  | { [key: string]: JsonSchema }

const ValueType: z.ZodType<JsonSchema> = z.lazy(() => z.union([
  z.number(),
  z.string(),
  z.boolean(),
  z.array(ValueType),
  z.record(ValueType),
]))

const jsonSchema = z.record(ValueType)

const personalizationSchema = z.object({
  subject: z.string().optional().describe('The subject of the message'),
  to: z.array(authorSchema).min(1).max(1000).describe('The recipients of the message'),
  reply_to: authorSchema.optional().describe('The reply-to author of the message'),
  from: authorSchema.optional().describe('The author of the message'),
  cc: z.array(authorSchema).max(1000).optional().describe('The CC recipients of the message'),
  bcc: z.array(authorSchema).max(1000).optional().describe('The BCC recipients of the message'),
  dkim_domain: z.string().optional().describe('The DKIM domain to use for the message'),
  dkim_private_key: z.string().optional().describe('The DKIM private key to use for the message'),
  dkim_selector: z.string().optional().describe('The DKIM selector to use for the message'),
  headers: z.record(z.string()).optional().describe('The headers to send with the message'),
  dynamic_template_data:
   jsonSchema.optional().describe('The dynamic template data to use for the message'),
})

const trackingSettingsSchema = z.object({
  click_tracking: z.object({
    enable: z.boolean().default(false).describe('Whether to enable click tracking'),
  }).default({}).describe('The click tracking settings'),
  open_tracking: z.object({
    enable: z.boolean().default(false).describe('Whether to enable open tracking'),
  }).default({}).describe('The open tracking settings'),
}).default({}).describe('The tracking settings')

const bodySchema = z.object({
  from: authorSchema.describe('The author of the message'),
  personalizations: z.array(personalizationSchema).max(1000).describe('The personalizations to send'),
  content: z.array(contentSchema).min(1).describe('The content to send'),
  subject: z.string().optional().describe('The subject of the message'),
  attachments: z.array(attachmentSchema).max(1000).optional().describe('The attachments to send'),
  campaign_id: z.string().max(48).optional().describe('The campaign ID to associate with the message'),
  dkim_domain: z.string().optional().describe('The DKIM domain to use for the message'),
  dkim_private_key: z.string().optional().describe('The DKIM private key to use for the message'),
  dkim_selector: z.string().optional().describe('The DKIM selector to use for the message'),
  reply_to: authorSchema.optional().describe('The reply-to author of the message'),
  headers: z.record(z.string()).optional().describe('The headers to send with the message'),
  tracking_settings: trackingSettingsSchema.describe('The tracking settings'),
})

export type SendBody = z.input<typeof bodySchema>

export default async function SendHandler(fastify: FastifyInstance) {
  fastify.post<{ Querystring: SendQuery, Body: SendBody }>('/send', {
    bodyLimit: 20 * 1024 * 1024
  }, async (request, reply) => {
    const parsed = bodySchema.safeParse(request.body)

    if (parsed.success === false) {
      const firstErrorPath = parsed.error.issues[0].path.join('.')
      const firstErrorMessage = parsed.error.issues[0].message

      throw fastify.httpErrors.badRequest(
        `Invalid request body: ${firstErrorPath} => ${firstErrorMessage}`
      )
    }

    // TODO: parse message with mustache

    if (request.query['dry-run']) {
      return reply.status(200).send({
        data: ['MailChannels Docker Development Server has not implemented the template parser yet. This is NOT a representation of what your email looks like.'],
      })
    }

    return reply.status(202).send({
      request_id: request.id,
      results: [],
    })
  })
}

