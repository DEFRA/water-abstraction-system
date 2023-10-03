'use strict'

// Test helpers
const GlobalNotifierLib = require('../../app/lib/global-notifier.lib.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Global Notifier plugin', () => {
  beforeEach(async () => {
    // Create server before each test
    await init()
  })

  describe('Global Notifier Plugin', () => {
    describe('when the server is initialised', () => {
      it('makes an instance of GlobalNotifierLib available globally', async () => {
        const result = global.GlobalNotifier

        expect(result).toBeInstanceOf(GlobalNotifierLib)
      })
    })
  })
})
