'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const BaseNotifierLib = require('../../app/lib/base-notifier.lib.js')

// Thing under test
const GlobalNotifierLib = require('../../app/lib/global-notifier.lib.js')

describe('GlobalNotifierLib class', () => {
  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)

    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
    Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#constructor', () => {
    describe('when the "logger" argument is not provided', () => {
      it('throws an error', () => {
        expect(() => {
          return new GlobalNotifierLib(null, airbrakeFake)
        }).to.throw()
      })
    })

    describe('when the "notifier" argument is not provided', () => {
      it('throws an error', () => {
        expect(() => {
          return new GlobalNotifierLib(pinoFake)
        }).to.throw()
      })
    })
  })
})
