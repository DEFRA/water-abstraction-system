'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const AddressFacadeRequest = require('../../../app/requests/address-facade.request.js')

// Thing under test
const LookupPostcodeRequest = require('../../../app/requests/address-facade/lookup-postcode.request.js')

describe('Requests - Address Facade - Lookup Postcode request', () => {
  const match = {
    uprn: 340116,
    address: 'ENVIRONMENT AGENCY, HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
    organisation: 'ENVIRONMENT AGENCY',
    premises: 'HORIZON HOUSE',
    street_address: 'DEANERY ROAD',
    locality: null,
    city: 'BRISTOL',
    postcode: 'BS1 5AH',
    country: 'United Kingdom'
  }
  const postcode = 'BS1 5AH'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      Sinon.stub(AddressFacadeRequest, 'get').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: []
          }
        },
        matches: [match]
      })
    })

    it('hits the correct endpoint', async () => {
      await LookupPostcodeRequest.send(postcode)

      const requestArgs = AddressFacadeRequest.get.firstCall.args

      expect(requestArgs[0]).to.equal(`address-service/v1/addresses/postcode?query-string=${postcode}&key=client1`)
    })

    it('returns a "true" success status', async () => {
      const result = await LookupPostcodeRequest.send(postcode)

      expect(result.succeeded).to.be.true()
    })

    it('returns the matching addresses', async () => {
      const result = await LookupPostcodeRequest.send(postcode)

      expect(result.matches).to.equal([match])
    })
  })

  describe('when the request cannot lookup a postcode', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(AddressFacadeRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: 404,
            body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
          },
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.response.body).to.equal({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found'
        })
      })

      it('does not returns any matches', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.matches).to.exist()
        expect(result.matches).to.be.instanceOf(Array)
        expect(result.matches).to.be.empty()
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(AddressFacadeRequest, 'get').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })

      it('does not returns any matches', async () => {
        const result = await LookupPostcodeRequest.send(postcode)

        expect(result.matches).to.exist()
        expect(result.matches).to.be.instanceOf(Array)
        expect(result.matches).to.be.empty()
      })
    })
  })
})
