'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_CREATED } = require('node:http2').constants
const { generateNoticeReferenceCode } = require('../../../app/lib/general.lib.js')

// Things we need to stub
const NotifyRequest = require('../../../app/requests/notify.request.js')

// Thing under test
const CreatePrecompiledFileRequest = require('../../../app/requests/notify/create-precompiled-file.request.js')

describe('Notify - Create precompiled file request', () => {
  let response
  let referenceCode
  let content

  afterEach(() => {
    Sinon.restore()
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

      Sinon.stub(NotifyRequest, 'post').resolves({
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

    it('calls NotifyRequest.post with the correct arguments', async () => {
      await CreatePrecompiledFileRequest.send(content, referenceCode)

      expect(NotifyRequest.post.calledOnce).toBe(true)
      expect(NotifyRequest.post.firstCall.args[0]).toEqual('v2/notifications/letter')
      expect(NotifyRequest.post.firstCall.args[1]).toEqual({ content: 'VGVzdCBkYXRh', reference: referenceCode })
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

        Sinon.stub(NotifyRequest, 'post').resolves({
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
