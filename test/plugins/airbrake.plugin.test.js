// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import AirbrakeModule from '@airbrake/node'
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

  // airbrake.plugin.js holds a module-level _notifier singleton, and the beforeAll above spins up a real Hapi server
  // that sets it via the real plugin module. These tests need a completely fresh module instance (where _notifier is
  // undefined) with Notifier and gotWrapper stubbed out, so we reset the module registry and dynamically re-import
  // the plugin (plus its first-party dependencies, which resetModules() also disconnects from the copies imported
  // above) per test. Notifier is stubbed via a default import of '@airbrake/node' (see
  // test/lib/base-notifier.lib.test.js for the same pattern) rather than a namespace import, because named exports
  // of a real ES module are non-configurable and can't be redefined by vi.spyOn().
  describe('when registering the plugin', () => {
    let AirbrakePluginWithStubs
    let fakeServer
    let freshServerConfig
    let freshGotWrapperLib

    beforeEach(async () => {
      vi.spyOn(AirbrakeModule, 'Notifier').mockImplementation(
        class {
          constructor(opts) {
            this.request = opts.request
          }
        }
      )

      fakeServer = {
        app: {},
        events: { on: vi.fn() },
        logger: { error: vi.fn() }
      }

      vi.resetModules()
      ;({ default: AirbrakePluginWithStubs } = await import('../../app/plugins/airbrake.plugin.js'))
      ;({ default: freshServerConfig } = await import('../../config/server.config.js'))
      freshGotWrapperLib = await import('../../app/lib/got-wrapper.lib.js')

      vi.spyOn(freshGotWrapperLib, 'gotWrapper').mockResolvedValue('fake-request-fn')
    })

    describe('and httpProxy is set', () => {
      beforeEach(() => {
        freshServerConfig.httpProxy = 'http://proxy.local:8080'
      })

      it('calls gotWrapper to create a Request function', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(freshGotWrapperLib.gotWrapper).toHaveBeenCalledOnce()
        expect(freshGotWrapperLib.gotWrapper.mock.calls[0][0]).toEqual({
          proxy: 'http://proxy.local:8080'
        })
      })

      it('passes the Request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(AirbrakeModule.Notifier).toHaveBeenCalledOnce()
        const args = AirbrakeModule.Notifier.mock.calls[0][0]
        expect(args.request).toEqual('fake-request-fn')
      })
    })

    describe('and httpProxy is not set', () => {
      beforeEach(() => {
        freshServerConfig.httpProxy = null
      })

      it('does not call gotWrapper', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(freshGotWrapperLib.gotWrapper).not.toHaveBeenCalled()
      })

      it('does not pass a request function to Notifier', async () => {
        await AirbrakePluginWithStubs.register(fakeServer)

        expect(AirbrakeModule.Notifier).toHaveBeenCalledOnce()
        const args = AirbrakeModule.Notifier.mock.calls[0][0]
        expect(args.request).toBeUndefined()
      })
    })
  })
})
