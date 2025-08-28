'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Proxyquire = require('proxyquire')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const serverConfig = require('../../config/server.config.js')

// For running our service
const { init } = require('../../app/server.js')

describe('Airbrake plugin', () => {
  let originalProxy
  let server

  before(async () => {
    // Spin up a real Hapi server instance (with all plugins, including Airbrake)
    server = await init()
  })

  beforeEach(() => {
    // Save original proxy config so we can restore it
    originalProxy = serverConfig.httpProxy

    // Silence noisy logs
    Sinon.stub(server.logger, 'error')

    // Stub out Airbrake notify so no real network calls are made
    Sinon.stub(server.app.airbrake, 'notify').resolvesThis()
  })

  afterEach(() => {
    serverConfig.httpProxy = originalProxy
    Sinon.restore()
  })

  describe('when a request error occurs', () => {
    let path

    beforeEach(() => {
      path = '/boom'
      server.route({
        method: 'GET',
        options: { auth: false },
        path,
        handler: () => {
          throw new Error('Test error')
        }
      })
    })

    it('calls airbrake.notify', async () => {
      await server.inject(path)

      expect(server.app.airbrake.notify.called).to.be.true()
    })
  })

  describe('when registering the plugin', () => {
    let AirbrakePluginWithStubs
    let fakeServer
    let gotWrapperStub
    let NotifierStub

    beforeEach(() => {
      gotWrapperStub = Sinon.stub().resolves('fake-request-fn')
      NotifierStub = Sinon.stub()

      AirbrakePluginWithStubs = Proxyquire('../../app/plugins/airbrake.plugin.js', {
        '../lib/got-wrapper.lib.js': { gotWrapper: gotWrapperStub },
        '@airbrake/node': { Notifier: NotifierStub },
        '../../config/server.config.js': serverConfig
      })

      fakeServer = {
        app: {},
        events: { on: Sinon.stub() },
        logger: { error: Sinon.stub() }
      }
    })

    describe('and httpProxy is set', () => {
      beforeEach(() => {
        serverConfig.httpProxy = 'http://proxy.local:8080'
      })

      it('calls gotWrapper to create a Request function', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(gotWrapperStub.calledOnce).to.be.true()
        expect(gotWrapperStub.firstCall.args[0]).to.equal({
          proxy: 'http://proxy.local:8080'
        })
      })

      it('passes the Request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(NotifierStub.calledOnce).to.be.true()
        const args = NotifierStub.firstCall.args[0]
        expect(args.request).to.equal('fake-request-fn')
      })
    })

    describe('and httpProxy is not set', () => {
      beforeEach(() => {
        serverConfig.httpProxy = null
      })

      it('does not call gotWrapper', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(gotWrapperStub.called).to.be.false()
      })

      it('does not pass a request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(NotifierStub.calledOnce).to.be.true()
        const args = NotifierStub.firstCall.args[0]
        expect(args.request).to.be.undefined()
      })
    })
  })
})
