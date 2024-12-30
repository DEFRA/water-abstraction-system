'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Thing under test
const ErrorPagesService = require('../../../app/services/plugins/error-pages.service.js')

describe('Error pages service', () => {
  const boom403Response = {
    message: "can't touch this",
    isBoom: true,
    output: {
      statusCode: 403
    }
  }
  const boom404Response = {
    message: 'where has my boom gone?',
    isBoom: true,
    output: {
      statusCode: 404
    }
  }
  const boom500Response = {
    message: 'tick, tick, tick, tick boom!',
    isBoom: true,
    output: {
      statusCode: 500
    }
  }
  const path = '/health/info'
  const standardResponse = {
    statusCode: 200
  }

  let notifierStub
  let request

  beforeEach(() => {
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    delete global.GlobalNotifier
    Sinon.restore()
  })

  describe('when the response is a boom 500 error', () => {
    beforeEach(() => {
      request = {
        response: boom500Response,
        route: { settings: {} },
        path
      }
    })

    it('logs an error', () => {
      ErrorPagesService.go(request)

      expect(notifierStub.omfg.calledWith(boom500Response.message)).to.be.true()
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.false()
      })

      it('returns the original status code', () => {
        const result = ErrorPagesService.go(request)

        expect(result.statusCode).to.equal(500)
      })
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.true()
      })

      it('returns a "safe" status code', () => {
        const result = ErrorPagesService.go(request)

        expect(result.statusCode).to.equal(200)
      })
    })
  })

  describe('when the response is a boom 404 error', () => {
    beforeEach(() => {
      request = {
        response: boom404Response,
        route: { settings: {} },
        path
      }
    })

    it('returns the correct status code', () => {
      const result = ErrorPagesService.go(request)

      expect(result.statusCode).to.equal(404)
    })

    it('logs a message', () => {
      ErrorPagesService.go(request)

      expect(notifierStub.omg.calledWith('Page not found', { path })).to.be.true()
    })

    describe('and the route is configured to return plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.false()
      })
    })

    describe('and the route is not configured (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.true()
      })
    })
  })

  describe('when the response is a boom 403 error', () => {
    beforeEach(() => {
      request = {
        response: boom403Response,
        route: { settings: {} },
        path
      }
    })

    it('logs a message', () => {
      ErrorPagesService.go(request)

      expect(notifierStub.omg.calledWith('Not authorised', { path })).to.be.true()
    })

    describe('and the route is configured to return plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.false()
      })

      it('returns the original status code', () => {
        const result = ErrorPagesService.go(request)

        expect(result.statusCode).to.equal(403)
      })
    })

    describe('and the route is not configured (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.true()
      })

      it('returns a "safe" status code', () => {
        const result = ErrorPagesService.go(request)

        expect(result.statusCode).to.equal(404)
      })
    })
  })

  describe('when the response is not a boom error', () => {
    beforeEach(() => {
      request = {
        response: standardResponse,
        route: { settings: {} },
        path
      }
    })

    it('returns the correct status code', () => {
      const result = ErrorPagesService.go(request)

      expect(result.statusCode).to.equal(standardResponse.statusCode)
    })

    it('does not log anything', () => {
      ErrorPagesService.go(request)

      expect(notifierStub.omg.called).to.be.false()
      expect(notifierStub.omfg.called).to.be.false()
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.false()
      })
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService.go(request)

        expect(result.stopResponse).to.be.false()
      })
    })
  })
})
