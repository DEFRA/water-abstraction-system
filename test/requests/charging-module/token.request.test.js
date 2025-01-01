'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const BaseRequest = require('../../../app/requests/base.request.js')

// Thing under test
const TokenRequest = require('../../../app/requests/charging-module/token.request.js')

describe('Charging Module Token request', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when the request is able to generate a token', () => {
    beforeEach(() => {
      Sinon.stub(BaseRequest, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: '{"access_token":"reallylong.stringoflettersandnumbers.in3parts","expires_in":3600,"token_type":"Bearer"}'
        }
      })
    })

    it('returns an object with the access token and how long till it expires', async () => {
      const result = await TokenRequest.send()

      expect(result.accessToken).to.equal('reallylong.stringoflettersandnumbers.in3parts')
      expect(result.expiresIn).to.equal(3600)
    })
  })

  describe('when the request cannot generate a token', () => {
    beforeEach(() => {
      Sinon.stub(BaseRequest, 'post').resolves({
        succeeded: false,
        response: {
          statusCode: 500,
          body: 'Kaboom'
        }
      })
    })

    it('returns an object with empty access token expires in properties', async () => {
      const result = await TokenRequest.send()

      expect(result.accessToken).to.be.null()
      expect(result.expiresIn).to.be.null()
    })
  })
})
