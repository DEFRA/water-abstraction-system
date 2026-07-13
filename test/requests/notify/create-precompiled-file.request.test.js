// Test framework dependencies

// Test helpers
import http2 from 'node:http2'
import { generateNoticeReferenceCode } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as NotifyRequest from '../../../app/requests/notify.request.js'

// Thing under test
import * as CreatePrecompiledFileRequest from '../../../app/requests/notify/create-precompiled-file.request.js'
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED } = http2.constants

describe('Notify - Create precompiled file request', () => {
  let response
  let referenceCode
  let content

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      referenceCode = generateNoticeReferenceCode('RINV-')
      content = new TextEncoder().encode('Test data').buffer

      response = {
        statusCode: HTTP_STATUS_CREATED,
        body: {
          id: 'f39a18b7-f12a-4149-9aad-da18d6972b48',
          postage: 'second',
          reference: referenceCode
        }
      }

      vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreatePrecompiledFileRequest.send(content, referenceCode)

      expect(result.succeeded).toBe(true)
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await CreatePrecompiledFileRequest.send(content, referenceCode)

      expect(result.response.body).toEqual(response.body)
    })

    it('calls NotifyRequest.postRequest with the correct arguments', async () => {
      await CreatePrecompiledFileRequest.send(content, referenceCode)

      expect(NotifyRequest.postRequest).toHaveBeenCalledOnce()
      expect(NotifyRequest.postRequest.mock.calls[0][0]).toEqual('v2/notifications/letter')
      expect(NotifyRequest.postRequest.mock.calls[0][1]).toEqual({ content: 'VGVzdCBkYXRh', reference: referenceCode })
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: HTTP_STATUS_BAD_REQUEST,
          body: {
            errors: [
              {
                error: 'BadRequestError',
                message: 'Letter content is not a valid PDF'
              }
            ],
            status_code: HTTP_STATUS_BAD_REQUEST
          }
        }

        vi.spyOn(NotifyRequest, 'postRequest').mockResolvedValue({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreatePrecompiledFileRequest.send(content, referenceCode)

        expect(result.succeeded).toBe(false)
      })

      it('returns the error in the "response"', async () => {
        const result = await CreatePrecompiledFileRequest.send(content, referenceCode)

        expect(result.response.body).toEqual(response.body)
      })
    })
  })
})
