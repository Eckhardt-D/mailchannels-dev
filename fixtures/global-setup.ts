import { startMailServer } from '../src/mail-server.js'

let teardownHappened = false

export default async function () {
  const mailserver = await startMailServer()

  return async () => {
    if (teardownHappened) {
      throw new Error('teardown already happened')
    }

    teardownHappened = true
    await mailserver.close()
  }
}
