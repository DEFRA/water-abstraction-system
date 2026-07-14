import http2 from 'node:http2'

// Things we need to stub
import * as LegacyRequest from '../../../app/requests/legacy.request.js'

// Thing under test
import * as ViewHealthRequest from '../../../app/requests/legacy/view-health.request.js'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Legacy - View Health request', () => {
  const serviceName = 'import'

  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: {
          version: 'v2.36.1',
          commit: 'f6d9d43deb8d3a600fa582143e8f4e55b7e0c372'
        }
      }

      vi.spyOn(LegacyRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response
      }) // TODO: withArgs(serviceName) not converted
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send(serviceName)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from a Legacy service in the "response"', async () => {
      const result = await ViewHealthRequest.send(serviceName)

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            error: 'Not Found',
            message: 'Not Found'
          }
        }

        vi.spyOn(LegacyRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response
        }) // TODO: withArgs(serviceName) not converted
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest.send(serviceName)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest.send(serviceName)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
