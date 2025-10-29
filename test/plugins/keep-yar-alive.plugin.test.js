'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const Hapi = require('@hapi/hapi')

// Thing under test
const KeepYarAlivePlugin = require('../../app/plugins/keep-yar-alive.plugin.js')

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

    notifierStub = { omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  it('registers successfully', () => {
    expect(server.registrations.keepYarAlive).to.exist()
  })

  describe('when the route does not have the "skipSessionTouch" setting applied', () => {
    beforeEach(() => {
      yarStub = {
        touch: Sinon.stub()
      }

      _attachYarStub(server, yarStub)
    })

    it('touches the Yar session to update the TTL and keep it alive', async () => {
      const response = await server.inject('/')

      expect(response.statusCode).to.equal(200)
      expect(response.result).to.equal('ok')

      expect(yarStub.touch.called).to.be.true()

      expect(global.GlobalNotifier.omfg.called).to.be.false()
    })
  })

  describe('when the route does have the "skipSessionTouch" setting applied', () => {
    beforeEach(() => {
      yarStub = {
        touch: Sinon.stub()
      }

      _attachYarStub(server, yarStub)
    })

    it('skips touching the Yar session', async () => {
      const res = await server.inject('/skip')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.equal('skipped')

      expect(yarStub.touch.called).to.be.false()

      expect(global.GlobalNotifier.omfg.called).to.be.false()
    })
  })

  describe('when the route does not have the Yar session available', () => {
    it('skips touching the Yar session', async () => {
      const res = await server.inject('/skip')

      expect(res.statusCode).to.equal(200)
      expect(res.result).to.equal('skipped')

      expect(yarStub.touch.called).to.be.false()

      expect(global.GlobalNotifier.omfg.called).to.be.false()
    })
  })

  describe('should an error be thrown when trying to keep the session alive', () => {
    beforeEach(() => {
      yarStub = {
        touch: Sinon.stub().throws(new Error('boom'))
      }

      _attachYarStub(server, yarStub)
    })

    it('handles Yar errors gracefully', async () => {
      const response = await server.inject('/')

      expect(response.statusCode).to.equal(200)
      expect(response.result).to.equal('ok')

      expect(global.GlobalNotifier.omfg.firstCall.args[0]).to.include('Failed to keep session alive')
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
