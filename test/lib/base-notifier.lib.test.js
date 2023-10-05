'use strict'

const BaseNotifierLib = require('../../app/lib/base-notifier.lib.js')

describe('BaseNotifierLib class', () => {
  const id = '1234567890'
  const message = 'say what test'

  let airbrakeFake
  let pinoFake

  beforeEach(() => {
    // We use these fakes and the mocks in the tests to avoid instantiating Airbrake or Pino during testing
    airbrakeFake = { notify: jest.fn().mockResolvedValue({ id: 1 }), flush: jest.fn() }
    pinoFake = { info: jest.fn(), error: jest.fn() }
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#omg()', () => {
    beforeEach(() => {
      jest.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      jest.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
    })

    describe('when just a message is logged', () => {
      it("logs a correctly formatted 'info' level entry", () => {
        const testNotifier = new BaseNotifierLib()
        testNotifier.omg(message)

        expect(pinoFake.info).toHaveBeenCalledWith({}, message)
      })
    })

    describe('when a message and some data are to be logged', () => {
      it("logs a correctly formatted 'info' level entry", () => {
        const testNotifier = new BaseNotifierLib()
        testNotifier.omg(message, { id })

        expect(pinoFake.info).toHaveBeenCalledWith({ id }, message)
      })
    })

    it("does not send a notification to 'Errbit'", () => {
      const testNotifier = new BaseNotifierLib()
      testNotifier.omg(message)

      expect(airbrakeFake.notify).not.toHaveBeenCalled()
    })

    it("does not log an 'error' message", () => {
      const testNotifier = new BaseNotifierLib()
      testNotifier.omg(message)

      expect(pinoFake.error).not.toHaveBeenCalled()
    })
  })

  describe('#omfg()', () => {
    const testError = new Error('hell no test')
    describe('when the Airbrake notification succeeds', () => {
      beforeEach(() => {
        jest.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
        jest.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
      })

      describe('and just a message is logged', () => {
        it("logs a correctly formatted 'error' level entry", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(message)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it("sends the expected notification to 'Errbit'", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message)

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(message)
          expect(session).toEqual({ message })
        })
      })
      describe('and a message and some data is to be logged', () => {
        it("logs a correctly formatted 'error' level entry", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, { id })

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(message)
          expect(logPacketArgs[0].id).toEqual(id)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it("sends the expected notification to 'Errbit'", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, { id })

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(message)
          expect(session).toEqual({ id, message })
        })
      })

      describe('and a message, some data and an error is to be logged', () => {
        it("logs a correctly formatted 'error' level entry", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, { id }, testError)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(testError.message)
          expect(logPacketArgs[0].id).toEqual(id)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it("sends the expected notification to 'Errbit'", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, { id }, testError)

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(testError.message)
          expect(session).toEqual({ id, message })
        })
      })

      describe('and a message, no data but an error is to be logged', () => {
        it("logs a correctly formatted 'error' level entry", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, null, testError)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(testError.message)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it("sends the expected notification to 'Errbit'", () => {
          const testNotifier = new BaseNotifierLib()
          testNotifier.omfg(message, null, testError)

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(testError.message)
          expect(session).toEqual({ message })
        })
      })
    })
    describe('when the Airbrake notification fails', () => {
      const airbrakeFailure = new Error('Airbrake failure')

      beforeEach(() => {
        // We specifically use a stub instead of a fake so we can then use Sinon's callsFake() function.
        pinoFake = { info: jest.fn(), error: jest.fn() }
        jest.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)

        airbrakeFake = { notify: jest.fn().mockResolvedValue({ name: 'foo', error: airbrakeFailure }) }
        jest.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      })

      it("logs 2 'error' messages, the second containing details of the Airbrake failure", async () => {
        const testNotifier = new BaseNotifierLib()
        testNotifier.omfg(message)

        // We use Sinon callsFake() here in order to test our expectations.
        pinoFake.error.mockImplementation(async () => {
          const firstCallArgs = pinoFake.error.mock.calls[0]

          expect(firstCallArgs[0].err).toBeInstanceOf(Error)
          expect(firstCallArgs[0].err.message).toEqual(message)
          expect(firstCallArgs[1]).toEqual(message)

          const secondCallArgs = pinoFake.error.mock.calls[1]

          expect(secondCallArgs[0]).toBeInstanceOf(Error)
          expect(secondCallArgs[0].message).toEqual(airbrakeFailure.message)
          expect(secondCallArgs[1]).toEqual('BaseNotifierLib - Airbrake failed')
        })
      })
    })

    describe('when the Airbrake notification errors', () => {
      const airbrakeError = new Error('Airbrake error')

      beforeEach(() => {
        pinoFake = { info: jest.fn(), error: jest.fn() }
        jest.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)

        airbrakeFake = { notify: jest.fn().mockRejectedValue(airbrakeError) }
        jest.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      })

      it("logs 2 'error' messages, the second containing details of the Airbrake errors", async () => {
        const testNotifier = new BaseNotifierLib()
        testNotifier.omfg(message)

        pinoFake.error.mockImplementation(async () => {
          const firstCallArgs = pinoFake.error.mock.calls[0]

          expect(firstCallArgs[0].err).toBeInstanceOf(Error)
          expect(firstCallArgs[0].err.message).toEqual(message)
          expect(firstCallArgs[1]).toEqual(message)

          const secondCallArgs = pinoFake.error.mock.calls[1]

          expect(secondCallArgs[0]).toBeInstanceOf(Error)
          expect(secondCallArgs[0].message).toEqual(airbrakeError.message)
          expect(secondCallArgs[1]).toEqual('BaseNotifierLib - Airbrake errored')
        })
      })
    })
  })

  describe('#flush()', () => {
    beforeEach(() => {
      jest.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
    })

    it('tells the underlying Airbrake notifier to flush its queue of notifications', () => {
      const testNotifier = new BaseNotifierLib()
      testNotifier.flush()

      expect(airbrakeFake.flush).toHaveBeenCalled()
    })
  })
})
