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
const LookupCompaniesHouseNumberRequest = require('../../../app/requests/companies-house/lookup-companies-house-number.request.js')

describe('Companies House - Lookup Companies House Number request', () => {
  const companiesHouseNumber = '12345678'

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
            company_number: 12345678,
            company_name: 'Example Ltd'
          }
        }
      })
    })

    it('hits the correct endpoint', async () => {
      await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      const requestArgs = CompaniesHouseRequest.get.firstCall.args

      expect(requestArgs[0]).to.equal(`company/${companiesHouseNumber}`)
    })

    it('returns a "true" success status', async () => {
      const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      expect(result.succeeded).to.be.true()
    })

    it('returns the matching company', async () => {
      const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

      expect(result.response.body).to.equal({
        company_number: 12345678,
        company_name: 'Example Ltd'
      })
    })
  })

  describe('when the request cannot lookup the company', () => {
    describe('because the request did not return a 2xx/3xx response', () => {
      beforeEach(async () => {
        Sinon.stub(CompaniesHouseRequest, 'get').resolves({
          succeeded: false,
          response: {
            statusCode: HTTP_STATUS_NOT_FOUND,
            body: { message: 'Resource not found for company profile 12345678' }
          }
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.succeeded).to.be.false()
      })

      it('returns an error in the "response"', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.response.body).to.equal({
          message: 'Resource not found for company profile 12345678'
        })
        expect(result.response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
      })
    })

    describe('because the request attempt returned an error, for example, TimeoutError', () => {
      beforeEach(async () => {
        Sinon.stub(CompaniesHouseRequest, 'get').resolves({
          succeeded: false,
          response: new Error("Timeout awaiting 'request' for 5000ms")
        })
      })

      it('returns a "false" success status', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.succeeded).to.be.false()
      })

      it('returns the error in the "response"', async () => {
        const result = await LookupCompaniesHouseNumberRequest.send(companiesHouseNumber)

        expect(result.response.statusCode).not.to.exist()
        expect(result.response.body).not.to.exist()
        expect(result.response.message).to.equal("Timeout awaiting 'request' for 5000ms")
      })
    })
  })
})
