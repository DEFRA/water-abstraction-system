'use strict'

const { HTTP_STATUS_NOT_FOUND, HTTP_STATUS_OK } = require('node:http2').constants

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BaseRequest = require('../../app/requests/base.request.js')
const companiesHouseConfig = require('../../config/companies-house.config.js')
const serverConfig = require('../../config/server.config.js')

// Thing under test
const CompaniesHouseRequest = require('../../app/requests/companies-house.request.js')

describe('Companies House Request', () => {
  const accessToken = Buffer.from('API_KEY').toString('base64')
  const testRoute = 'TEST_ROUTE'

  beforeEach(() => {
    Sinon.stub(companiesHouseConfig, 'apiKey').value('API_KEY')
    Sinon.stub(serverConfig, 'requestTimeout').value(1000)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('#get', () => {
    describe('when the request succeeds', () => {
      beforeEach(async () => {
        Sinon.stub(BaseRequest, 'get').resolves({
          succeeded: true,
          response: {
            statusCode: HTTP_STATUS_OK,
            body: { items: [{ company_number: '12345678' }] }
          }
        })
      })

      it('calls Companies House with the required options', async () => {
        await CompaniesHouseRequest.get(testRoute)

        const requestArgs = BaseRequest.get.firstCall.args

        expect(requestArgs[0]).to.endWith('TEST_ROUTE')
        expect(requestArgs[1].headers).to.include({ authorization: `Basic ${accessToken}` })
      })

      it('returns a "true" success status', async () => {
        const result = await CompaniesHouseRequest.get(testRoute)

        expect(result.succeeded).to.be.true()
      })

      it('returns the response body as an object', async () => {
        const result = await CompaniesHouseRequest.get(testRoute)

        expect(result.response.body.items[0].company_number).to.equal('12345678')
      })

      it('returns the status code', async () => {
        const result = await CompaniesHouseRequest.get(testRoute)

        expect(result.response.statusCode).to.equal(HTTP_STATUS_OK)
      })
    })

    describe('when the request fails', () => {
      describe('but returns a body', () => {
        beforeEach(async () => {
          Sinon.stub(BaseRequest, 'get').resolves({
            succeeded: false,
            response: {
              statusCode: HTTP_STATUS_NOT_FOUND,
              statusMessage: 'Not Found',
              body: { statusCode: HTTP_STATUS_NOT_FOUND, error: 'Not Found', message: 'Not Found' }
            }
          })
        })

        it('returns a "false" success status', async () => {
          const result = await CompaniesHouseRequest.get(testRoute)

          expect(result.succeeded).to.be.false()
        })

        it('returns the error response', async () => {
          const result = await CompaniesHouseRequest.get(testRoute)

          expect(result.response.body.message).to.equal('Not Found')
        })

        it('returns the status code', async () => {
          const result = await CompaniesHouseRequest.get(testRoute)

          expect(result.response.statusCode).to.equal(HTTP_STATUS_NOT_FOUND)
        })
      })

      describe('but does not return a body', () => {
        beforeEach(async () => {
          Sinon.stub(BaseRequest, 'get').resolves({
            succeeded: false,
            response: {
              error: 'Something went wrong'
            }
          })
        })

        it('returns a "error"', async () => {
          const result = await CompaniesHouseRequest.get(testRoute)

          expect(result.response.error).to.equal('Something went wrong')
        })
      })
    })
  })
})
