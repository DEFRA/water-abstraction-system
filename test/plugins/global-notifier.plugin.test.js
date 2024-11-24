'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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

        expect(result).to.be.an.instanceOf(GlobalNotifierLib)
      })
    })
  })
})
