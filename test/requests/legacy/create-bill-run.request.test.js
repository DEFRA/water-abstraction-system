'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const LegacyRequest = require('../../../app/requests/legacy.request.js')

// Thing under test
const CreateBillRunRequest = require('../../../app/requests/legacy/create-bill-run.request.js')

describe('Legacy Create Bill Run request', () => {
  const batchType = 'two_part_tariff'
  const regionId = '8feaf2c1-f7cd-47f1-93b9-0d2218d20d56'
  const financialYearEnding = 2024
  const user = { id: '1c4ce580-9053-4531-ba23-d0cf0caf0562', username: 'carol.shaw@atari.com' }
  const summer = true

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request can create a bill run', () => {
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
      const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

      expect(result.succeeded).to.be.true()
    })

    it('returns a 200 - ok', async () => {
      const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

      expect(result.response.statusCode).to.equal(200)
      expect(result.response.body).to.be.null()
    })
  })

  describe('when the request cannot create a bill run', () => {
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
        const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

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
        const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CreateBillRunRequest.send(batchType, regionId, financialYearEnding, user, summer)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
