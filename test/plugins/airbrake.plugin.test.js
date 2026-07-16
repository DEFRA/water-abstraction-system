// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import serverConfig from '../../config/server.config.js'

// For running our service
import { init } from '../../app/server.js'

describe('Airbrake plugin', () => {
  let originalProxy
  let server

  beforeAll(async () => {
    // Spin up a real Hapi server instance (with all plugins, including Airbrake)
    server = await init()
  })

  beforeEach(() => {
    // Save original proxy config so we can restore it
    originalProxy = serverConfig.httpProxy

    // Silence noisy logs
    vi.spyOn(server.logger, 'error').mockImplementation(() => {})

    // Stub out Airbrake notify so no real network calls are made
    vi.spyOn(server.app.airbrake, 'notify').mockResolvedValue(undefined)
  })

  afterEach(() => {
    serverConfig.httpProxy = originalProxy
    vi.restoreAllMocks()
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

      expect(server.app.airbrake.notify).toHaveBeenCalled()
    })
  })

  // TODO: Remove describe.skip once the project migrates to ESM. In CJS mode, airbrake.plugin.js holds a module-level
  // _notifier singleton. The beforeAll above spins up a real Hapi server that sets it via the real plugin module.
  // These tests need a completely fresh module instance (where _notifier is undefined) with Notifier and gotWrapper
  // stubbed out. Proxyquire provides that isolation today. We do not use vi.mock() here or once the project is ESM
  // — see the testing skill's Mocking section for why. Instead, once ESM, use vi.resetModules() + dynamic import()
  // to load a fresh plugin instance per test, then vi.spyOn() the namespace imports of '@airbrake/node' and
  // '../lib/got-wrapper.lib.js' to stub their exports.
  describe.skip('when registering the plugin', () => {
    let AirbrakePluginWithStubs
    let fakeServer
    let gotWrapperStub
    let NotifierStub

    beforeEach(() => {
      gotWrapperStub = vi.fn().mockResolvedValue('fake-request-fn')
      NotifierStub = vi.fn()

      // TODO: Replace with vi.spyOn() + dynamic import() once the project migrates to ESM
      // AirbrakePluginWithStubs = Proxyquire('../../app/plugins/airbrake.plugin.js', {
      //   '../lib/got-wrapper.lib.js': { gotWrapper: gotWrapperStub },
      //   '@airbrake/node': { Notifier: NotifierStub },
      //   '../../config/server.config.js': serverConfig
      // })

      fakeServer = {
        app: {},
        events: { on: vi.fn() },
        logger: { error: vi.fn() }
      }
    })

    describe('and httpProxy is set', () => {
      beforeEach(() => {
        serverConfig.httpProxy = 'http://proxy.local:8080'
      })

      it('calls gotWrapper to create a Request function', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(gotWrapperStub).toHaveBeenCalledOnce()
        expect(gotWrapperStub.mock.calls[0][0]).toEqual({
          proxy: 'http://proxy.local:8080'
        })
      })

      it('passes the Request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(NotifierStub).toHaveBeenCalledOnce()
        const args = NotifierStub.mock.calls[0][0]
        expect(args.request).toEqual('fake-request-fn')
      })
    })

    describe('and httpProxy is not set', () => {
      beforeEach(() => {
        serverConfig.httpProxy = null
      })

      it('does not call gotWrapper', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(gotWrapperStub).not.toHaveBeenCalled()
      })

      it('does not pass a request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(NotifierStub).toHaveBeenCalledOnce()
        const args = NotifierStub.mock.calls[0][0]
        expect(args.request).toBeUndefined()
      })
    })
  })
})
