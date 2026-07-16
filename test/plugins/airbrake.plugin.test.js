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

  // TODO: airbrake.plugin.js holds a module-level _notifier singleton. The beforeAll above spins up a real Hapi
  // server that sets it via the real plugin module, so these tests need a completely fresh module instance (where
  // _notifier is undefined) with Notifier and gotWrapper stubbed out. Proxyquire provided that isolation in CJS
  // mode, but it's a CJS-only tool and no longer works now the project is ESM.
  //
  // vi.resetModules() + dynamic import() looks like the obvious ESM replacement, and Notifier can be stubbed via a
  // default import of '@airbrake/node' (see test/lib/base-notifier.lib.test.js) — but don't reach for
  // vi.resetModules() here. This project's vitest.config.js runs the 'parallel' project with `isolate: false` (a
  // single shared module registry across test files, for performance). Resetting the registry in one test file
  // doesn't just create a locally-fresh copy — it invalidates the *shared* cache entry for
  // 'app/plugins/airbrake.plugin.js', so the next test FILE anywhere in the run that imports this plugin for the
  // first time gets re-pointed at whatever instance this test last created, singleton state and all. This was tried
  // and confirmed to break unrelated controller tests elsewhere in the suite (their `server.app.airbrake.notify`
  // came back undefined, because the shared _notifier had been left pointing at this test's stub).
  //
  // A safer route if this gets picked up again: export the plugin's private `_notifierArgs()` helper and test it
  // directly — it contains all the gotWrapper/proxy logic these tests care about, without needing to go through
  // register() or touch the _notifier singleton at all. We do not use vi.mock()/vi.doMock() here — see the testing
  // skill's Mocking section for why.
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
