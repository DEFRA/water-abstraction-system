'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const LegacyRequest = require('../../../app/requests/legacy.request.js')

// Thing under test
const RefreshBillRunRequest = require('../../../app/requests/legacy/refresh-bill-run.request.js')

describe('Legacy Refresh Bill Run request', () => {
  const billRunId = '2bbbe459-966e-4026-b5d2-2f10867bdddd'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can refresh a bill run', () => {
    beforeEach(async () => {
      Sinon.stub(LegacyRequest, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: null
        }
      })
    })

    it('returns a "true" success status', async () => {
      const result = await RefreshBillRunRequest.send(billRunId)

      expect(result.succeeded).to.be.true()
    })

    it('returns a 200 - ok', async () => {
      const result = await RefreshBillRunRequest.send(billRunId)

      expect(result.response.statusCode).to.equal(200)
      expect(result.response.body).to.be.null()
    })
  })

  describe('when the request cannot refresh a bill run', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(LegacyRequest, 'post').resolves({
          succeeded: false,
          response: {
            statusCode: 401,
            body: {
              statusCode: 401,
              error: 'Unauthorized',
              message: 'Invalid JWT: Token format not valid',
              attributes: { error: 'Invalid JWT: Token format not valid' }
            }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await RefreshBillRunRequest.send(billRunId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await RefreshBillRunRequest.send(billRunId)

        expect(result.response.body.statusCode).to.equal(401)
        expect(result.response.body.error).to.equal('Unauthorized')
        expect(result.response.body.message).to.equal('Invalid JWT: Token format not valid')
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(LegacyRequest, 'post').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await RefreshBillRunRequest.send(billRunId)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await RefreshBillRunRequest.send(billRunId)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
