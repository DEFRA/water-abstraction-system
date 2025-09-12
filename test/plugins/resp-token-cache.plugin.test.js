'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const RespTokenRequest = require('../../app/requests/resp/token.request.js')

// For running our service
const { init } = require('../../app/server.js')

const LONG_EXPIRY_TIME = 3600
const SHORT_EXPIRY_TIME = 1

describe('ReSP Token Cache plugin', () => {
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the first call returns a valid token', () => {
    describe('and the second request is made before the cache expires', () => {
      before(() => {
        Sinon.stub(RespTokenRequest, 'send')
          .onFirstCall()
          .resolves({ accessToken: 'FIRST_TOKEN', expiresIn: LONG_EXPIRY_TIME })
          .onSecondCall()
          .resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns the cached token', async () => {
        const firstCall = await server.methods.getRespToken()
        const secondCall = await server.methods.getRespToken()

        expect(firstCall.accessToken).to.equal('FIRST_TOKEN')
        expect(secondCall.accessToken).to.equal('FIRST_TOKEN')
      })
    })

    describe('and the second request is made after the cache expires', () => {
      before(() => {
        Sinon.stub(RespTokenRequest, 'send')
          .onFirstCall()
          .resolves({ accessToken: 'FIRST_TOKEN', expiresIn: SHORT_EXPIRY_TIME })
          .onSecondCall()
          .resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns a new token', async () => {
        await server.methods.getRespToken()
        const result = await server.methods.getRespToken()

        expect(result.accessToken).to.equal('SECOND_TOKEN')
      })
    })
  })

  describe('When the first call returns an invalid token', () => {
    beforeEach(() => {
      Sinon.stub(RespTokenRequest, 'send')
        .onFirstCall()
        .resolves({ accessToken: null, expiresIn: null })
        .onSecondCall()
        .resolves({ accessToken: 'VALID_TOKEN', expiresIn: LONG_EXPIRY_TIME })
    })

    it('returns a null token', async () => {
      const result = await server.methods.getRespToken()

      expect(result.accessToken).to.be.null()
    })

    it('does not cache the token', async () => {
      await server.methods.getRespToken()
      const secondCall = await server.methods.getRespToken()

      expect(secondCall.accessToken).to.equal('VALID_TOKEN')
    })
  })
})
