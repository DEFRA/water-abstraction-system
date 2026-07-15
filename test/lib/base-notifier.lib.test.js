// Test helpers
import { NOTIFY_TEMPLATES } from '../../app/lib/notify-templates.lib.js'

// Things we need to stub
import AirbrakeModule from '@airbrake/node'
import AirbrakeConfig from '../../config/airbrake.config.js'
import * as CreateEmailRequest from '../../app/requests/notify/create-email.request.js'
import NotifyConfig from '../../config/notify.config.js'

// Thing under test
import BaseNotifierLib from '../../app/lib/base-notifier.lib.js'

describe('BaseNotifierLib class', () => {
  const id = '1234567890'
  const error = 'test error'
  const message = 'say what test'

  let airbrakeFake
  let createEmailRequestFake
  let pinoFake

  beforeEach(async () => {
    // We use these fakes and the stubs in the tests to avoid Pino or Airbrake being instantiated during the test
    airbrakeFake = { notify: vi.fn().mockResolvedValue({ id: 1 }), flush: vi.fn() }
    createEmailRequestFake = { send: vi.fn().mockResolvedValue() }
    pinoFake = { info: vi.fn(), error: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('#omg()', () => {
    beforeEach(async () => {
      vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
    })

    describe('when just a message is logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omg(message)

        expect(pinoFake.info).toHaveBeenCalledExactlyOnceWith({}, message)
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omg(message, { id })

        expect(pinoFake.info).toHaveBeenCalledExactlyOnceWith({ id }, message)
      })
    })

    it('does not send a notification to "Errbit"', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.omg(message)

      expect(airbrakeFake.notify).not.toHaveBeenCalled()
    })

    it('does not log an "error" message', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.omg(message)

      expect(pinoFake.error).not.toHaveBeenCalled()
    })
  })

  describe('#omfg()', () => {
    const testError = new Error('hell no test')

    describe('when the Airbrake notification succeeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
        vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
      })

      describe('and just a message is logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(message)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message)

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(message)
          expect(session).toEqual({ message })
        })
      })

      describe('and a message and some data is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id })

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(message)
          expect(logPacketArgs[0].id).toEqual(id)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id })

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(message)
          expect(session).toEqual({ id, message })
        })
      })

      describe('and a message, some data and an error is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id }, testError)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(testError.message)
          expect(logPacketArgs[0].id).toEqual(id)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id }, testError)

          const { error, session } = airbrakeFake.notify.mock.calls[0][0]

          expect(error).toBeInstanceOf(Error)
          expect(error.message).toEqual(testError.message)
          expect(session).toEqual({ id, message })
        })
      })

      describe('and a message, no data but an error is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, null, testError)

          const logPacketArgs = pinoFake.error.mock.calls[0]

          expect(logPacketArgs[0].err).toBeInstanceOf(Error)
          expect(logPacketArgs[0].err.message).toEqual(testError.message)
          expect(logPacketArgs[1]).toEqual(message)
        })

        it('sends the expected notification to "Errbit"', () => {
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

      beforeEach(async () => {
        // We specifically use a stub instead of a fake so we can then use Sinon's callsFake() function. See the test
        // below where callsFake() is used for more details.
        pinoFake = { info: vi.fn(), error: vi.fn() }
        vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)

        airbrakeFake = { notify: vi.fn().mockResolvedValue({ name: 'foo', error: airbrakeFailure }) }
        vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      })

      it('logs 2 "error" messages, the second containing details of the Airbrake failure', async () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omfg(message)

        // We use Sinon callsFake() here in order to test our expectations. This is because Airbrake notify() actually
        // returns a promise, and it is on the calling code to handle the responses back. When we test sending the
        // Airbrake notification control immediately comes back to us whilst work continues in the background. If we
        // assert pinoFake.error.secondCall.calledWith() it always fails because the promise which calls it has not yet
        // resolved. So, callsFake() tells Sinon to call our anonymous function below that includes our assertion only
        // when pinoFake.error is called i.e. the Airbrake.notify() promise has resolved.
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

      beforeEach(async () => {
        pinoFake = { info: vi.fn(), error: vi.fn() }
        vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)

        airbrakeFake = { notify: vi.fn().mockRejectedValue(airbrakeError) }
        vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
      })

      it('logs 2 "error" messages, the second containing details of the Airbrake errors', async () => {
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

  describe('#redAlert()', () => {
    describe('when create email request service suceeds', () => {
      beforeEach(async () => {
        vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
        vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
        vi.spyOn(CreateEmailRequest, 'send').mockImplementation(createEmailRequestFake.send)
        vi.replaceProperty(NotifyConfig, 'alertEmailAddresses', 'admin-internal@wrls.gov.uk')
      })

      describe('when just a message is sent', () => {
        it('sends a request to the create email request service with the correct parameters', async () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.redAlert(message)

          const args = createEmailRequestFake.send.mock.calls[0]

          expect(args[0]).toEqual(NOTIFY_TEMPLATES.system.statusAlert)
          expect(args[1]).toEqual(NotifyConfig.alertEmailAddresses)
          expect(args[2].personalisation.content.endsWith(message)).toBe(true)
        })
      })

      describe('when a message is sent with an error', () => {
        it('sends a request to the create email request service with the correct parameters', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.redAlert(message, error)

          const args = createEmailRequestFake.send.mock.calls[0]

          expect(args[0]).toEqual(NOTIFY_TEMPLATES.system.statusAlert)
          expect(args[1]).toEqual(NotifyConfig.alertEmailAddresses)
          expect(args[2].personalisation.content.endsWith(`${message} with: ${error}`)).toBe(true)
        })
      })

      describe('and there are multiple email addresses in the config', () => {
        beforeEach(async () => {
          vi.replaceProperty(NotifyConfig, 'alertEmailAddresses', 'admin-internal@wrls.gov.uk,admin@wrls.gov.uk')
        })

        it('sends a request to the create email request service with the correct parameters for each email', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.redAlert(message, error)

          const firstArgs = createEmailRequestFake.send.mock.calls[0]
          const secondArgs = createEmailRequestFake.send.mock.calls[1]

          expect(firstArgs[0]).toEqual(NOTIFY_TEMPLATES.system.statusAlert)
          expect(firstArgs[1]).toEqual('admin-internal@wrls.gov.uk')
          expect(firstArgs[2].personalisation.content.endsWith(`${message} with: ${error}`)).toBe(true)
          expect(secondArgs[0]).toEqual(NOTIFY_TEMPLATES.system.statusAlert)
          expect(secondArgs[1]).toEqual('admin@wrls.gov.uk')
          expect(secondArgs[2].personalisation.content.endsWith(`${message} with: ${error}`)).toBe(true)
        })
      })
    })

    describe('when the create email request service errors', () => {
      beforeEach(async () => {
        vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
        vi.replaceProperty(NotifyConfig, 'alertEmailAddresses', 'admin-internal@wrls.gov.uk')

        pinoFake = { info: vi.fn(), error: vi.fn() }
        vi.spyOn(BaseNotifierLib.prototype, '_setLogger').mockReturnValue(pinoFake)
        vi.spyOn(CreateEmailRequest, 'send').mockRejectedValue(new Error('CreateEmailRequest errored'))
      })

      it('logs the error', async () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.redAlert(message)

        pinoFake.error.mockImplementation(async () => {
          const firstCallArgs = pinoFake.error.mock.calls[0]

          expect(firstCallArgs[0]).toBeInstanceOf(Error)
          expect(firstCallArgs[0].message).toEqual('CreateEmailRequest errored')
          expect(firstCallArgs[1]).toEqual('BaseNotifierLib - CreateEmailRequest errored')
        })
      })
    })
  })

  describe('#flush()', () => {
    beforeEach(async () => {
      vi.spyOn(BaseNotifierLib.prototype, '_setNotifier').mockReturnValue(airbrakeFake)
    })

    it('tells the underlying Airbrake notifier to flush its queue of notifications', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.flush()

      expect(airbrakeFake.flush).toHaveBeenCalled()
    })
  })

  describe('when no notifier is passed to the constructor', () => {
    beforeEach(() => {
      vi.replaceProperty(AirbrakeConfig, 'host', 'air')
      vi.replaceProperty(AirbrakeConfig, 'projectKey', 'hosts')
      vi.replaceProperty(AirbrakeConfig, 'projectId', 1)
      vi.replaceProperty(AirbrakeConfig, 'environment', 'plane')

      // Stub the Notifier constructor
      vi.spyOn(AirbrakeModule, 'Notifier').mockImplementation(
        class {
          constructor(opts) {
            this._opt = opts
          }

          notify() {}

          flush() {}
        }
      )
    })

    it('creates a new Airbrake Notifier instance with config', () => {
      const testNotifier = new BaseNotifierLib(pinoFake)

      expect(testNotifier._notifier._opt).toMatchObject({
        host: 'air',
        projectKey: 'hosts',
        projectId: 1,
        environment: 'plane',
        performanceStats: false
      })
    })
  })
})
