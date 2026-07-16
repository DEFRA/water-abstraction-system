// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Thing under test
import RequestNotifierLib from '../../app/lib/request-notifier.lib.js'

describe('RequestNotifierLib class', () => {
  const id = '1234567890'
  const message = 'say what test'

  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    airbrakeFake = { notify: vi.fn().mockResolvedValue({ id: 1 }), flush: vi.fn() }
    pinoFake = { info: vi.fn(), error: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#omg()', () => {
    describe('when just a message is logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omg(message)

        expect(pinoFake.info).toHaveBeenCalledExactlyOnceWith({ req: { id } }, message)
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omg(message, { name: 'foo' })

        expect(pinoFake.info).toHaveBeenCalledExactlyOnceWith({ name: 'foo', req: { id } }, message)
      })
    })
  })

  describe('#omfg()', () => {
    const testError = new Error('hell no test')

    describe('when just a message is logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message)

        const logPacketArgs = pinoFake.error.mock.calls[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toEqual(message)
        expect(logPacketArgs[0].req.id).toEqual(id)
        expect(logPacketArgs[1]).toEqual(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message)

        const { error, session } = airbrakeFake.notify.mock.calls[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toEqual(message)
        expect(session).toEqual({ message, req: { id } })
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' })

        const logPacketArgs = pinoFake.error.mock.calls[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toEqual(message)
        expect(logPacketArgs[0].req.id).toEqual(id)
        expect(logPacketArgs[0].name).toEqual('foo')
        expect(logPacketArgs[1]).toEqual(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' })

        const { error, session } = airbrakeFake.notify.mock.calls[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toEqual(message)
        expect(session).toEqual({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, some data and an error is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' }, testError)

        const logPacketArgs = pinoFake.error.mock.calls[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toEqual(testError.message)
        expect(logPacketArgs[0].req.id).toEqual(id)
        expect(logPacketArgs[0].name).toEqual('foo')
        expect(logPacketArgs[1]).toEqual(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, { name: 'foo' }, testError)

        const { error, session } = airbrakeFake.notify.mock.calls[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toEqual(testError.message)
        expect(session).toEqual({ name: 'foo', message, req: { id } })
      })
    })

    describe('when a message, no data but an error is to be logged', () => {
      it('logs a correctly formatted "error" level entry', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, null, testError)

        const logPacketArgs = pinoFake.error.mock.calls[0]

        expect(logPacketArgs[0].err).toBeInstanceOf(Error)
        expect(logPacketArgs[0].err.message).toEqual(testError.message)
        expect(logPacketArgs[0].req.id).toEqual(id)
        expect(logPacketArgs[1]).toEqual(message)
      })

      it('sends the expected notification to "Errbit"', () => {
        const testNotifier = new RequestNotifierLib(id, pinoFake, airbrakeFake)

        testNotifier.omfg(message, null, testError)

        const { error, session } = airbrakeFake.notify.mock.calls[0][0]

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toEqual(testError.message)
        expect(session).toEqual({ message, req: { id } })
      })
    })
  })
})
