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

      // More test cases for different scenarios can be added here
    })

    // More test cases for different scenarios can be added here
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
