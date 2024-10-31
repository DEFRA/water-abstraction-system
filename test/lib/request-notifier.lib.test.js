'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Thing under test
const RequestNotifierLib = require('../../app/lib/request-notifier.lib.js')

describe('RequestNotifierLib class', () => {
  const id = '1234567890'
  const message = 'say what test'

  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#omg()', () => {
    describe('when just a message is logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omg(message)

        expect(pinoFake.info.calledOnceWith({ req: { id } }, message)).to.be.true()
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omg(message, { name: 'foo' })

        expect(pinoFake.info.calledOnceWith({ name: 'foo', req: { id } }, message)).to.be.true()
      })
    })
  })

  describe('#omfg()', () => {
    const testError = new Error('hell no test')

    describe('when just a message is logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).to.be.an.error()
        expect(logPacketArgs[0].err.message).to.equal(message)
        expect(logPacketArgs[0].req.id).to.equal(id)
        expect(logPacketArgs[1]).to.equal(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).to.be.an.error()
        expect(error.message).to.equal(message)
        expect(session).to.equal({ message, req: { id } })
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' })

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).to.be.an.error()
        expect(logPacketArgs[0].err.message).to.equal(message)
        expect(logPacketArgs[0].req.id).to.equal(id)
        expect(logPacketArgs[0].name).to.equal('foo')
        expect(logPacketArgs[1]).to.equal(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' })

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).to.be.an.error()
        expect(error.message).to.equal(message)
        expect(session).to.equal({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, some data and an error is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' }, testError)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).to.be.an.error()
        expect(logPacketArgs[0].err.message).to.equal(testError.message)
        expect(logPacketArgs[0].req.id).to.equal(id)
        expect(logPacketArgs[0].name).to.equal('foo')
        expect(logPacketArgs[1]).to.equal(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' }, testError)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).to.be.an.error()
        expect(error.message).to.equal(testError.message)
        expect(session).to.equal({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, no data but an error is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, null, testError)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).to.be.an.error()
        expect(logPacketArgs[0].err.message).to.equal(testError.message)
        expect(logPacketArgs[0].req.id).to.equal(id)
        expect(logPacketArgs[1]).to.equal(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, null, testError)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).to.be.an.error()
        expect(error.message).to.equal(testError.message)
        expect(session).to.equal({ message, req: { id } })
      })
    })
  })
})
