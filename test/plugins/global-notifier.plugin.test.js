'use strict'

// Test helpers
const GlobalNotifierLib = require('../../app/lib/global-notifier.lib.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Global Notifier plugin', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()
  })

  afterEach(async () => {
    await server.stop()
  })

  describe('Global Notifier Plugin', () => {
    describe('when the server is initialised', () => {
      it('makes an instance of GlobalNotifierLib available globally', async () => {
        const result = globalThis.GlobalNotifier

        expect(result).toBeInstanceOf(GlobalNotifierLib)
      })
    })
  })
})
