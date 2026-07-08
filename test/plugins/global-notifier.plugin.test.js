// Test helpers
import * as GlobalNotifierLib from '../../app/lib/global-notifier.lib.js'

// For running our service
import { init } from '../../app/server.js'

describe('Global Notifier plugin', () => {
  beforeEach(async () => {
    // Create server before each test
    await init()
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
