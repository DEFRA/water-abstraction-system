'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Thing under test
const BoomNotifierLib = require('../../app/lib/boom-notifier.lib.js')

describe('BoomNotifierLib class', () => {
  const id = '1234567890'
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when an airbrake notification is sent', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it('throws a Boom error with the correct message and data', async () => {
      const testNotifier = new BoomNotifierLib(id, pinoFake, airbrakeFake)

      expect(() => {
        return testNotifier.omfg(message, data)
      }).to.throw(Error, { message, data })
    })
  })
})
