'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const CompaniesHouseRequest = require('../../../app/requests/companies-house.request.js')

// Thing under test
const CompaniesRequest = require('../../../app/requests/companies-house/companies.request.js')

describe('Companies House - Companies request', () => {
  const matches = [
    {
      address_snippet: 'HORIZON HOUSE, DEANERY ROAD, BRISTOL, BS1 5AH',
      company_number: 340116,
      title: 'ENVIRONMENT AGENCY'
    }
  ]
  const queryString = 'Example Ltd'

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      Sinon.stub(CompaniesHouseRequest, 'get').resolves({
        succeeded: true,
        response: {
          statusCode: HTTP_STATUS_OK,
          body: {
            items: matches
          }
        },
        matches
      })
    })

    it('hits the correct endpoint', async () => {
      await CompaniesRequest.send(queryString)

      const requestArgs = CompaniesHouseRequest.get.firstCall.args

      expect(requestArgs[0]).to.equal('search/companies?q=Example Ltd&start_index=0&items_per_page=15')
    })

    it('returns a "true" success status', async () => {
      const result = await CompaniesRequest.send(queryString)

      expect(result.succeeded).to.be.true()
    })

    it('returns the matching addresses', async () => {
      const result = await CompaniesRequest.send(queryString)

      expect(result.matches).to.equal(matches)
    })
  })

  describe('when the request cannot lookup companies', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(CompaniesHouseRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
          },
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.succeeded).to.be.false()
      })

      it('returns an error in the "response"', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.response.body).to.equal({
          statusCode: HTTP_STATUS_NOT_FOUND,
          error: 'Not Found',
          message: 'Not Found'
        })
      })

      it('does not returns any matches', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.response.body.items).not.to.exist()
        expect(result.matches).to.be.instanceOf(Array)
        expect(result.matches).to.be.empty()
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(CompaniesHouseRequest, 'get').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms"),
          matches: []
        })
      })

      it('returns a "false" success status', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })

      it('does not returns any matches', async () => {
        const result = await CompaniesRequest.send(queryString)

        expect(result.matches).to.exist()
        expect(result.matches).to.be.instanceOf(Array)
        expect(result.matches).to.be.empty()
      })
    })
  })
})
