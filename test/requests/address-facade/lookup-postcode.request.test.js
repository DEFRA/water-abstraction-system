'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const servicesConfig = require('../../../config/services.config.js')

// Things we need to stub
const BaseRequest = require('../../../app/requests/base.request.js')

// Thing under test
const LookupPostcodeRequest = require('../../../app/requests/address-facade/lookup-postcode.request.js')

describe('Requests - Address Facade - Lookup Postcode request', () => {
  const postcode = 'SW1A 1AA'
  const postcodePath = `address-service/v1/addresses/postcode?query-string=${postcode}&key=client1`

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request succeeds', () => {
    beforeEach(async () => {
      Sinon.stub(BaseRequest, 'get').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: {
            results: []
          }
        }
      })
    })

    it('calls the address lookup url with the required options', async () => {
      await LookupPostcodeRequest.send(postcode)

      const requestArgs = BaseRequest.get.firstCall.args

      expect(requestArgs[0]).to.equal(postcodePath)
      expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.addressFacade.url}`)
      expect(requestArgs[1].responseType).to.equal('json')
    })

    it('returns a valid repsonse', async () => {
      const result = await LookupPostcodeRequest.send(postcode)

      expect(result.succeeded).to.be.true()
      expect(result.results).to.equal([])
    })
  })

  describe('when the request fails', () => {
    beforeEach(async () => {
      Sinon.stub(BaseRequest, 'get').resolves({
        succeeded: false,
        response: {
          statusCode: 404,
          statusMessage: 'Not Found',
          body: { statusCode: 404, error: 'Not Found', message: 'Not Found' }
        }
      })
    })

    it('returns a "false" success status and an empty array', async () => {
      const result = await LookupPostcodeRequest.send(postcode)

      expect(result.succeeded).to.be.false()
      expect(result.results).to.equal([])
    })
  })
})
