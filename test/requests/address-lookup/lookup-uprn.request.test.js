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
const LookupUPRNRequest = require('../../../app/requests/address-lookup/lookup-uprn.request.js')

describe('Lookup UPRN Request', () => {
  const uprn = '123456789'
  const uprnPath = `address-service/v1/addresses/${uprn}?key=client1`

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
      await LookupUPRNRequest.send(uprn)

      const requestArgs = BaseRequest.get.firstCall.args

      expect(requestArgs[0]).to.equal(uprnPath)
      expect(requestArgs[1].prefixUrl).to.equal(`${servicesConfig.addressFacade.url}`)
      expect(requestArgs[1].responseType).to.equal('json')
    })

    it('returns a valid repsonse', async () => {
      const result = await LookupUPRNRequest.send(uprn)

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
      const result = await LookupUPRNRequest.send(uprn)

      expect(result.succeeded).to.be.false()
      expect(result.results).to.equal([])
    })
  })
})
