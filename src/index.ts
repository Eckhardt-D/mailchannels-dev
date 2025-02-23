import { build } from './server.js'

const server = await build()

await server.listen({
  port: 8008,
  host: '0.0.0.0',
})
