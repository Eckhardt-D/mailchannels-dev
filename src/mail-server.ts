import Maildev from 'maildev'

let instance: InstanceType<typeof Maildev> | undefined

export async function startMailServer() {
  if (instance !== undefined) {
    return instance
  }

  instance = new Maildev({
    // @ts-expect-error DefinitelyTyped is wrong about this not being a valid option, see https://github.com/maildev/maildev/blob/master/docs/api.md
    basePathname: '/mails',
    silent: true,
  })

  await new Promise<void>((resolve, reject) => {
    instance!.listen((err) => {
      if (err) {
        return reject(new Error(`Maildev failed to start: ${err.message}`))
      }
      return resolve()
    })
  })

  async function close() {
    if (!instance) {
      return
    }

    await new Promise((resolve) => {
      instance!.close(() => {
        resolve(undefined)
      })
    })
  }

  return {
    close,
  }
}
