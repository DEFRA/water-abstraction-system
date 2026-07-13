import http2 from 'node:http2'

// Test framework dependencies

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import * as ViewHealthRequest from '../../../app/requests/notify/view-health.request.js'
const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = http2.constants

describe('Notify - View Health request', () => {
  let response

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      response = {
        statusCode: HTTP_STATUS_OK,
        body: {
          build_time: '2025-08-20:07:53:38',
          db_version: '0511_process_type_nullable',
          git_commit: '9a404353ee55a7f7cb3b8348b169ad00cc2d540a',
          status: 'ok'
        }
      }

      vi.spyOn(NotifyRequest, 'getRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await ViewHealthRequest.send()

      expect(result.response.body).toEqual(response.body)
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_NOT_FOUND,
          body: {
            message:
              'The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.',
            result: 'error'
          }
        }

        vi.spyOn(NotifyRequest, 'getRequest').mockResolvedValue({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await ViewHealthRequest.send()

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
