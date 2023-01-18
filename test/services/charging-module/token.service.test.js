'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const RequestLib = require('../../../app/lib/request.lib.js')

// Thing under test
const ChargingModuleTokenService = require('../../../app/services/charging-module/token.service.js')

describe('Charging module token service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is able to generate a token', () => {
    beforeEach(() => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: '{"access_token":"reallylong.stringoflettersandnumbers.in3parts","expires_in":3600,"token_type":"Bearer"}'
        }
      })
    })

    it('returns an object with the access token and how long till it expires', async () => {
      const result = await ChargingModuleTokenService.go()

      expect(result.accessToken).to.equal('reallylong.stringoflettersandnumbers.in3parts')
      expect(result.expiresIn).to.equal(3600)
    })
  })

  describe('when the service cannot generate a token', () => {
    beforeEach(() => {
      Sinon.stub(RequestLib, 'post').resolves({
        succeeded: false,
        response: {
          statusCode: 500,
          body: 'Kaboom'
        }
      })
    })

    it('returns an object with empty access token expires in properties', async () => {
      const result = await ChargingModuleTokenService.go()

      expect(result.accessToken).to.be.null()
      expect(result.expiresIn).to.be.null()
    })
  })
})
