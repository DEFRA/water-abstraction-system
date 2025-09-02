'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const NotifyRequest = require('../../../app/requests/notify.request.js')

// Thing under test
const CreatePrecompiledFileRequest = require('../../../app/requests/notify/create-precompiled-file.request.js')

describe('Notify - Create precompiled file request', () => {
  let response
  let reference
  let content

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(() => {
      reference = 'test-123'
      content = new TextEncoder().encode('Test data').buffer

      response = {
        statusCode: 201,
        body: {
          id: 'f39a18b7-f12a-4149-9aad-da18d6972b48',
          postage: 'second',
          reference: 'test-123'
        }
      }

      Sinon.stub(NotifyRequest, 'post').resolves({
        succeeded: true,
        response
      })
    })

    it('returns a "true" success status', async () => {
      const result = await CreatePrecompiledFileRequest.send(content, reference)

      expect(result.succeeded).to.be.true()
    })

    it('returns the result from Notify in the "response"', async () => {
      const result = await CreatePrecompiledFileRequest.send(content, reference)

      expect(result.response.body).to.equal(response.body)
    })

    it('calls NotifyRequest.post with the correct arguments', async () => {
      await CreatePrecompiledFileRequest.send(content, reference)

      expect(NotifyRequest.post.calledOnce).to.be.true()
      expect(NotifyRequest.post.firstCall.args[0]).to.equal('v2/notifications/letter')
      expect(NotifyRequest.post.firstCall.args[1]).to.equal({ content: 'VGVzdCBkYXRh', reference: 'test-123' })
    })
  })

  describe('when the request fails', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        response = {
          statusCode: 400,
          body: {
            errors: [
              {
                error: 'BadRequestError',
                message: 'Letter content is not a valid PDF'
              }
            ],
            status_code: 400
          }
        }

        Sinon.stub(NotifyRequest, 'post').resolves({
          succeeded: false,
          response
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CreatePrecompiledFileRequest.send(content, reference)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CreatePrecompiledFileRequest.send(content, reference)

        expect(result.response.body).to.equal(response.body)
      })
    })
  })
})
