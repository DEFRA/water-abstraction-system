// Test framework
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import * as AirbrakeNode from '@airbrake/node'
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

  // airbrake.plugin.js holds a module-level _notifier singleton. The beforeAll above spins up a real Hapi server
  // that sets it via the real plugin module. These tests need a completely fresh module instance (where _notifier
  // is undefined) with Notifier and gotWrapper stubbed out. We get that by resetting Vitest's module registry and
  // dynamically re-importing everything the plugin depends on before re-importing the plugin itself, then stubbing
  // the fresh instances. This also picks up a fresh copy of server.config.js, so we mutate that fresh instance
  // rather than the one imported at the top of this file.
  describe('when registering the plugin', () => {
    let AirbrakePluginWithStubs
    let fakeServer
    let freshServerConfig
    let gotWrapperStub
    let NotifierStub

    beforeEach(async () => {
      vi.resetModules()

      freshServerConfig = (await import('../../config/server.config.js')).default

      const GotWrapperLib = await import('../../app/lib/got-wrapper.lib.js')
      gotWrapperStub = vi.fn().mockResolvedValue('fake-request-fn')
      vi.spyOn(GotWrapperLib, 'gotWrapper').mockImplementation(gotWrapperStub)

      NotifierStub = vi.fn()
      vi.spyOn(AirbrakeNode, 'Notifier').mockImplementation(NotifierStub)

      AirbrakePluginWithStubs = (await import('../../app/plugins/airbrake.plugin.js')).default

      fakeServer = {
        app: {},
        events: { on: vi.fn() },
        logger: { error: vi.fn() }
      }
    })

    describe('and httpProxy is set', () => {
      beforeEach(() => {
        freshServerConfig.httpProxy = 'http://proxy.local:8080'
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
        freshServerConfig.httpProxy = null
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
