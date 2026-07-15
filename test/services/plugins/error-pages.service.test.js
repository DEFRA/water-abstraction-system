import http2 from 'node:http2'

// Test helpers
import SessionNotFoundError from '../../../app/errors/session-not-found.error.js'

// Things we need to stub
import GlobalNotifierStub from '../../support/stubs/global-notifier.stub.js'

// Thing under test
import ErrorPagesService from '../../../app/services/plugins/error-pages.service.js'
const {
  HTTP_STATUS_FORBIDDEN,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_OK,
  HTTP_STATUS_GONE
} = http2.constants

describe('Error pages service', () => {
  const boom403Response = {
    message: "can't touch this",
    isBoom: true,
    output: {
      statusCode: HTTP_STATUS_FORBIDDEN
    }
  }

  const boom404Response = {
    message: 'where has my boom gone?',
    isBoom: true,
    output: {
      statusCode: HTTP_STATUS_NOT_FOUND
    }
  }

  const boom410Response = {
    ...new SessionNotFoundError('Session has expired'),
    isBoom: true,
    output: { statusCode: HTTP_STATUS_GONE }
  }

  const boom500Response = {
    message: 'tick, tick, tick, tick boom!',
    isBoom: true,
    output: {
      statusCode: HTTP_STATUS_INTERNAL_SERVER_ERROR
    }
  }
  const path = '/health/info'
  const standardResponse = {
    statusCode: HTTP_STATUS_OK
  }

  let notifierStub
  let request

  beforeEach(() => {
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
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
      ErrorPagesService(request)

      expect(notifierStub.omfg).toHaveBeenCalledWith(boom500Response.message, {}, boom500Response)
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })

      it('returns the original status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_INTERNAL_SERVER_ERROR)
      })
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(true)
      })

      it('returns a "safe" status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_OK)
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
      const result = ErrorPagesService(request)

      expect(result.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
    })

    it('logs a message', () => {
      ErrorPagesService(request)

      expect(notifierStub.omg).toHaveBeenCalledWith('Page not found', { path })
    })

    describe('and the route is configured to return plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })
    })

    describe('and the route is not configured (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(true)
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
      ErrorPagesService(request)

      expect(notifierStub.omg).toHaveBeenCalledWith('Not authorised', { path })
    })

    describe('and the route is configured to return plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })

      it('returns the original status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_FORBIDDEN)
      })
    })

    describe('and the route is not configured (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(true)
      })

      it('returns a "safe" status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_NOT_FOUND)
      })
    })
  })

  describe('when the response is a boom 410 error', () => {
    beforeEach(() => {
      request = {
        response: boom410Response,
        route: { settings: {} },
        path
      }
    })

    it('logs a message', () => {
      ErrorPagesService(request)

      expect(notifierStub.omg).toHaveBeenCalledWith('Session not found', { path })
    })

    describe('and the route is configured to return plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })

      it('returns the original status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_GONE)
      })
    })

    describe('and the route is not configured (redirect to error page)', () => {
      it('tells the plugin to stop the response and redirect to an error page', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(true)
      })

      it('returns a "safe" status code', () => {
        const result = ErrorPagesService(request)

        expect(result.statusCode).toEqual(HTTP_STATUS_GONE)
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
      const result = ErrorPagesService(request)

      expect(result.statusCode).toEqual(standardResponse.statusCode)
    })

    it('does not log anything', () => {
      ErrorPagesService(request)

      expect(notifierStub.omg).not.toHaveBeenCalled()
      expect(notifierStub.omfg).not.toHaveBeenCalled()
    })

    describe('and the route is configured for plain output (do not redirect to error page)', () => {
      beforeEach(() => {
        request.route = { settings: { app: { plainOutput: true } } }
      })

      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })
    })

    describe('and the route is not configured for plain output (redirect to error page)', () => {
      it('tells the plugin not to stop the response from continuing', () => {
        const result = ErrorPagesService(request)

        expect(result.stopResponse).toBe(false)
      })
    })
  })
})
