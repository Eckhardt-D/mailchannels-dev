import { startMailServer } from './mail-server.js'
import { build } from './server.js'

const { close } = await startMailServer()
const server = await build()

server.addHook('onClose', () => {
  close()
})

await server.listen({
  port: 8008,
  host: '0.0.0.0',
})
