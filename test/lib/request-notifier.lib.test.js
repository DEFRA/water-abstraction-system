'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals')
const RequestNotifierLib = require('../../app/lib/request-notifier.lib.js')
const sinon = require('sinon')

describe('RequestNotifierLib class', () => {
  const id = '1234567890'
  const message = 'say what test'
  const testError = new Error('hell no test')

  let airbrakeFake
  let pinoFake

  beforeEach(() => {
    airbrakeFake = { notify: sinon.fake.resolves({ id: 1 }), flush: sinon.fake() }
    pinoFake = { info: sinon.fake(), error: sinon.fake() }
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('#omg()', () => {
    describe('when just a message is logged', () => {
      it("logs a correctly formatted 'info' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omg(message)

        expect(pinoFake.info.calledWith({ req: { id } }, message)).toBe(true)
      })
    })

    describe('when a message and some data is to be logged', () => {
      it("logs a correctly formatted 'info' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omg(message, { name: 'foo' })

        expect(pinoFake.info.calledWith({ name: 'foo', req: { id } }, message)).toBe(true)
      })
    })
  })

  describe('#omfg()', () => {
    describe('when just a message is logged', () => {
      it("logs a correctly formatted 'error' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toBe(message)
        expect(logPacketArgs[0].req.id).toBe(id)
        expect(logPacketArgs[1]).toBe(message)
      })

      it("sends the expected notification to 'Errbit'", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe(message)
        expect(session).toEqual({ message, req: { id } })
      })
    })

    describe('when a message and some data is to be logged', () => {
      it("logs a correctly formatted 'error' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, { name: 'foo' })

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toBe(message)
        expect(logPacketArgs[0].req.id).toBe(id)
        expect(logPacketArgs[0].name).toBe('foo')
        expect(logPacketArgs[1]).toBe(message)
      })

      it("sends the expected notification to 'Errbit'", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, { name: 'foo' })

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe(message)
        expect(session).toEqual({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, some data, and an error is to be logged', () => {
      it("logs a correctly formatted 'error' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, { name: 'foo' }, testError)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toBe(testError.message)
        expect(logPacketArgs[0].req.id).toBe(id)
        expect(logPacketArgs[0].name).toBe('foo')
        expect(logPacketArgs[1]).toBe(message)
      })

      it("sends the expected notification to 'Errbit'", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, { name: 'foo' }, testError)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe(testError.message)
        expect(session).toEqual({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, no data, but an error is to be logged', () => {
      it("logs a correctly formatted 'error' level entry", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, null, testError)

        const logPacketArgs = pinoFake.error.args[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toBe(testError.message)
        expect(logPacketArgs[0].req.id).toBe(id)
        expect(logPacketArgs[1]).toBe(message)
      })

      it("sends the expected notification to 'Errbit'", () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)
        testNotifier.omfg(message, null, testError)

        const { error, session } = airbrakeFake.notify.args[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe(testError.message)
        expect(session).toEqual({ message, req: { id } })
      })
    })
  })
})
