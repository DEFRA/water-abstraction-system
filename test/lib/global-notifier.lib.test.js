'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

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
    describe("when the 'logger' argument is not provided", () => {
      it('throws an error', () => {
        expect(() => new GlobalNotifierLib(null, airbrakeFake)).to.throw()
      })
    })

    describe("when the 'notifier' argument is not provided", () => {
      it('throws an error', () => {
        expect(() => new GlobalNotifierLib(pinoFake)).to.throw()
      })
    })
  })

  describe('when a log entry is made', () => {
    const id = '1234567890'
    const message = 'say what test'

    it('formats it as expected', () => {
      const expectedArgs = {
        message,
        id
      }
      const testNotifier = new GlobalNotifierLib(pinoFake, airbrakeFake)
      testNotifier.omg(message, { id })

      expect(pinoFake.info.calledOnceWith(expectedArgs)).to.be.true()
    })
  })

  describe('when an airbrake notification is sent', () => {
    const message = 'hell no test'
    const data = { offTheChart: true }

    it('formats it as expected', () => {
      const expectedArgs = {
        message,
        session: {
          ...data
        }
      }
      const testNotifier = new GlobalNotifierLib(pinoFake, airbrakeFake)
      testNotifier.omfg(message, data)

      expect(airbrakeFake.notify.calledOnceWith(expectedArgs)).to.be.true()
    })
  })
})
