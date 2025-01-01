'use strict'

// Test framework dependencies
const { describe, it, before } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const GlobalNotifierLib = require('../../app/lib/global-notifier.lib.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Global Notifier plugin', () => {
  before(async () => {
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
