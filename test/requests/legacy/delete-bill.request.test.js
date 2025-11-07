'use strict'

const { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_UNAUTHORIZED } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const LegacyRequest = require('../../../app/requests/legacy.request.js')

// Thing under test
const DeleteBillRequest = require('../../../app/requests/legacy/delete-bill.request.js')

describe('Legacy Delete Bill request', () => {
  const billRunId = 'e39023b2-f3a5-4d56-8bd1-28919b56b603'
  const billId = '8feaf2c1-f7cd-47f1-93b9-0d2218d20d56'
  const user = { id: '1c4ce580-9053-4531-ba23-d0cf0caf0562', username: 'carol.shaw@atari.com' }

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can delete a bill', () => {
    beforeEach(async () => {
      Sinon.stub(LegacyRequest, 'delete').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_NO_CONTENT,
          body: null
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await DeleteBillRequest.send(billRunId, billId, user)

      expect(result.succeeded).to.be.true()
    })

    it('returns a 204 - ok', async () => {
      const result = await DeleteBillRequest.send(billRunId, billId, user)

      expect(result.response.statusCode).to.equal(HTTP_STATUS_NO_CONTENT)
      expect(result.response.body).to.be.null()
    })
  })

  describe('when the request cannot delete a bill', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(LegacyRequest, 'delete').resolves({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_UNAUTHORIZED,
            body: {
              statusCode: HTTP_STATUS_UNAUTHORIZED,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await DeleteBillRequest.send(billRunId, billId, user)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await DeleteBillRequest.send(billRunId, billId, user)

        expect(result.response.body.statusCode).to.equal(HTTP_STATUS_UNAUTHORIZED)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(LegacyRequest, 'delete').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await DeleteBillRequest.send(billRunId, billId, user)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await DeleteBillRequest.send(billRunId, billId, user)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
