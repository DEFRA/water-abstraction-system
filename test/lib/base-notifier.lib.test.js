'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const AirbrakeModule = require('@airbrake/node')
const AirbrakeConfig = require('../../config/airbrake.config.js')

// Thing under test
const BaseNotifierLib = require('../../app/lib/base-notifier.lib.js')

describe('BaseNotifierLib class', () => {
  const id = '1234567890'
  const message = 'say what test'

  let airbrakeFake
  let pinoFake

  beforeEach(async () => {
    // We use these fakes and the stubs in the tests to avoid Pino or Airbrake being instantiated during the test
    airbrakeFake = { notify: Sinon.fake.resolves({ id: 1 }), flush: Sinon.fake() }
    pinoFake = { info: Sinon.fake(), error: Sinon.fake() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#omg()', () => {
    beforeEach(async () => {
      Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)
      Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)
    })

    describe('when just a message is logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omg(message)

        expect(pinoFake.info.calledOnceWith({}, message)).to.be.true()
      })
    })

    describe('when a message and some data is to be logged', () => {
      it('logs a correctly formatted "info" level entry', () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omg(message, { id })

        expect(pinoFake.info.calledOnceWith({ id }, message)).to.be.true()
      })
    })

    it('does not send a notification to "Errbit"', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.omg(message)

      expect(airbrakeFake.notify.notCalled).to.be.true()
    })

    it('does not log an "error" message', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.omg(message)

      expect(pinoFake.error.notCalled).to.be.true()
    })
  })

  describe('#omfg()', () => {
    const testError = new Error('hell no test')

    describe('when the Airbrake notification succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)
        Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)
      })

      describe('and just a message is logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message)

          const logPacketArgs = pinoFake.error.args[0]

          expect(logPacketArgs[0].err).to.be.an.error()
          expect(logPacketArgs[0].err.message).to.equal(message)
          expect(logPacketArgs[1]).to.equal(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message)

          const { error, session } = airbrakeFake.notify.args[0][0]

          expect(error).to.be.an.error()
          expect(error.message).to.equal(message)
          expect(session).to.equal({ message })
        })
      })

      describe('and a message and some data is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id })

          const logPacketArgs = pinoFake.error.args[0]

          expect(logPacketArgs[0].err).to.be.an.error()
          expect(logPacketArgs[0].err.message).to.equal(message)
          expect(logPacketArgs[0].id).to.equal(id)
          expect(logPacketArgs[1]).to.equal(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id })

          const { error, session } = airbrakeFake.notify.args[0][0]

          expect(error).to.be.an.error()
          expect(error.message).to.equal(message)
          expect(session).to.equal({ id, message })
        })
      })

      describe('and a message, some data and an error is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id }, testError)

          const logPacketArgs = pinoFake.error.args[0]

          expect(logPacketArgs[0].err).to.be.an.error()
          expect(logPacketArgs[0].err.message).to.equal(testError.message)
          expect(logPacketArgs[0].id).to.equal(id)
          expect(logPacketArgs[1]).to.equal(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, { id }, testError)

          const { error, session } = airbrakeFake.notify.args[0][0]

          expect(error).to.be.an.error()
          expect(error.message).to.equal(testError.message)
          expect(session).to.equal({ id, message })
        })
      })

      describe('and a message, no data but an error is to be logged', () => {
        it('logs a correctly formatted "error" level entry', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, null, testError)

          const logPacketArgs = pinoFake.error.args[0]

          expect(logPacketArgs[0].err).to.be.an.error()
          expect(logPacketArgs[0].err.message).to.equal(testError.message)
          expect(logPacketArgs[1]).to.equal(message)
        })

        it('sends the expected notification to "Errbit"', () => {
          const testNotifier = new BaseNotifierLib()

          testNotifier.omfg(message, null, testError)

          const { error, session } = airbrakeFake.notify.args[0][0]

          expect(error).to.be.an.error()
          expect(error.message).to.equal(testError.message)
          expect(session).to.equal({ message })
        })
      })
    })

    describe('when the Airbrake notification fails', () => {
      const airbrakeFailure = new Error('Airbrake failure')

      beforeEach(async () => {
        // We specifically use a stub instead of a fake so we can then use Sinon's callsFake() function. See the test
        // below where callsFake() is used for more details.
        pinoFake = { info: Sinon.fake(), error: Sinon.stub() }
        Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)

        airbrakeFake = { notify: Sinon.fake.resolves({ name: 'foo', error: airbrakeFailure }) }
        Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)
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
        pinoFake.error.callsFake(async () => {
          const firstCallArgs = pinoFake.error.firstCall.args

          expect(firstCallArgs[0].err).to.be.an.error()
          expect(firstCallArgs[0].err.message).to.equal(message)
          expect(firstCallArgs[1]).to.equal(message)

          const secondCallArgs = pinoFake.error.secondCall.args

          expect(secondCallArgs[0]).to.be.an.error()
          expect(secondCallArgs[0].message).to.equal(airbrakeFailure.message)
          expect(secondCallArgs[1]).to.equal('BaseNotifierLib - Airbrake failed')
        })
      })
    })

    describe('when the Airbrake notification errors', () => {
      const airbrakeError = new Error('Airbrake error')

      beforeEach(async () => {
        pinoFake = { info: Sinon.fake(), error: Sinon.stub() }
        Sinon.stub(BaseNotifierLib.prototype, '_setLogger').returns(pinoFake)

        airbrakeFake = { notify: Sinon.fake.rejects(airbrakeError) }
        Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)
      })

      it('logs 2 "error" messages, the second containing details of the Airbrake errors', async () => {
        const testNotifier = new BaseNotifierLib()

        testNotifier.omfg(message)

        pinoFake.error.callsFake(async () => {
          const firstCallArgs = pinoFake.error.firstCall.args

          expect(firstCallArgs[0].err).to.be.an.error()
          expect(firstCallArgs[0].err.message).to.equal(message)
          expect(firstCallArgs[1]).to.equal(message)

          const secondCallArgs = pinoFake.error.secondCall.args

          expect(secondCallArgs[0]).to.be.an.error()
          expect(secondCallArgs[0].message).to.equal(airbrakeError.message)
          expect(secondCallArgs[1]).to.equal('BaseNotifierLib - Airbrake errored')
        })
      })
    })
  })

  describe('#flush()', () => {
    beforeEach(async () => {
      Sinon.stub(BaseNotifierLib.prototype, '_setNotifier').returns(airbrakeFake)
    })

    it('tells the underlying Airbrake notifier to flush its queue of notifications', () => {
      const testNotifier = new BaseNotifierLib()

      testNotifier.flush()

      expect(airbrakeFake.flush.called).to.be.true()
    })
  })

  describe('when no notifier is passed to the constructor', () => {
    beforeEach(() => {
      Sinon.replace(AirbrakeConfig, 'host', 'air')
      Sinon.replace(AirbrakeConfig, 'projectKey', 'hosts')
      Sinon.replace(AirbrakeConfig, 'projectId', 1)
      Sinon.replace(AirbrakeConfig, 'environment', 'plane')

      // Stub the Notifier constructor
      Sinon.stub(AirbrakeModule, 'Notifier').returns({
        notify: Sinon.fake(),
        flush: Sinon.fake()
      })
    })

    it('creates a new Airbrake Notifier instance with config', () => {
      const testNotifier = new BaseNotifierLib(pinoFake)

      expect(testNotifier._notifier._opt).to.include({
        host: 'air',
        projectKey: 'hosts',
        projectId: 1,
        environment: 'plane',
        performanceStats: false
      })
    })
  })
})
