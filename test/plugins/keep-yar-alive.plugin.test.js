// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
const { HTTP_STATUS_OK } = http2.constants
import Hapi from '@hapi/hapi'

// Test helpers
import YarStub from '../support/stubs/yar.stub.js'

// Things we need to stub
import GlobalNotifierStub from '../support/stubs/global-notifier.stub.js'

// Thing under test
import KeepYarAlivePlugin from '../../app/plugins/keep-yar-alive.plugin.js'

describe('Keep Yar Alive plugin', () => {
  let notifierStub
  let server
  let yarStub

  beforeEach(async () => {
    // This setup exercises our plugin on its own instance of a Hapi server. This means we can isolate the setup and
    // focusing on testing it. This differs from our controller tests where we do want to exercise 'our' Hapi server
    // as defined in `app/server.js`.
    server = Hapi.server()

    // Register our plugin
    await server.register(KeepYarAlivePlugin)

    // A route that when called will result in the session being touched
    server.route({
      method: 'GET',
      path: '/',
      handler: (_request, _h) => {
        return 'ok'
      }
    })

    // A route with skipSessionTouch = true to confirm we don't touch the session if applied
    server.route({
      method: 'GET',
      path: '/skip',
      options: { app: { skipSessionTouch: true } },
      handler: (_request, _h) => {
        return 'skipped'
      }
    })

    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  it('registers successfully', () => {
    expect(server.registrations.keepYarAlive).toBeDefined()
  })

  describe('when the route does not have the "skipSessionTouch" setting applied', () => {
    beforeEach(() => {
      yarStub = YarStub()

      _attachYarStub(server, yarStub)
    })

    it('touches the Yar session to update the TTL and keep it alive', async () => {
      const response = await server.inject('/')

      expect(response.statusCode).toEqual(HTTP_STATUS_OK)
      expect(response.result).toEqual('ok')

      expect(yarStub.touch).toHaveBeenCalled()

      expect(globalThis.GlobalNotifier.omfg.called).toBe(false)
    })
  })

  describe('when the route does have the "skipSessionTouch" setting applied', () => {
    beforeEach(() => {
      yarStub = YarStub()

      _attachYarStub(server, yarStub)
    })

    it('skips touching the Yar session', async () => {
      const res = await server.inject('/skip')

      expect(res.statusCode).toEqual(HTTP_STATUS_OK)
      expect(res.result).toEqual('skipped')

      expect(yarStub.touch).not.toHaveBeenCalled()

      expect(globalThis.GlobalNotifier.omfg.called).toBe(false)
    })
  })

  describe('when the route does not have the Yar session available', () => {
    it('skips touching the Yar session', async () => {
      const res = await server.inject('/skip')

      expect(res.statusCode).toEqual(HTTP_STATUS_OK)
      expect(res.result).toEqual('skipped')

      expect(yarStub.touch).not.toHaveBeenCalled()

      expect(globalThis.GlobalNotifier.omfg.called).toBe(false)
    })
  })

  describe('should an error be thrown when trying to keep the session alive', () => {
    beforeEach(() => {
      yarStub = YarStub()
      yarStub.touch.throws(new Error('boom'))

      _attachYarStub(server, yarStub)
    })

    it('handles Yar errors gracefully', async () => {
      const response = await server.inject('/')

      expect(response.statusCode).toEqual(HTTP_STATUS_OK)
      expect(response.result).toEqual('ok')

      expect(globalThis.GlobalNotifier.omfg.mock.calls[0][0]).toContain('Failed to keep session alive')
    })
  })
})

/**
 * Ensure our 'fake' Yar plugin is attached before KeepYarAlivePlugin runs
 *
 * @private
 */
function _attachYarStub(server, yarStub) {
  server.ext(
    'onPreHandler',
    (request, h) => {
      request.yar = yarStub

      return h.continue
    },
    { before: ['keepYarAlive'] }
  )
}
