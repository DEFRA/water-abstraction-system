'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const ChargingModuleTokenRequest = require('../../app/requests/charging-module/token.request.js')

// For running our service
const { init } = require('../../app/server.js')

const LONG_EXPIRY_TIME = 3600
const SHORT_EXPIRY_TIME = 1

describe.skip('Charging Module Token Cache plugin', () => {
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
        Sinon.stub(ChargingModuleTokenRequest, 'send')
          .onFirstCall()
          .resolves({ accessToken: 'FIRST_TOKEN', expiresIn: LONG_EXPIRY_TIME })
          .onSecondCall()
          .resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns the cached token', async () => {
        const firstCall = await server.methods.getChargingModuleToken()
        const secondCall = await server.methods.getChargingModuleToken()

        expect(firstCall.accessToken).to.equal('FIRST_TOKEN')
        expect(secondCall.accessToken).to.equal('FIRST_TOKEN')
      })
    })

    describe('and the second request is made after the cache expires', () => {
      before(() => {
        Sinon.stub(ChargingModuleTokenRequest, 'send')
          .onFirstCall()
          .resolves({ accessToken: 'FIRST_TOKEN', expiresIn: SHORT_EXPIRY_TIME })
          .onSecondCall()
          .resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns a new token', async () => {
        await server.methods.getChargingModuleToken()
        const result = await server.methods.getChargingModuleToken()

        expect(result.accessToken).to.equal('SECOND_TOKEN')
      })
    })
  })

  describe('When the first call returns an invalid token', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleTokenRequest, 'send')
        .onFirstCall()
        .resolves({ accessToken: null, expiresIn: null })
        .onSecondCall()
        .resolves({ accessToken: 'VALID_TOKEN', expiresIn: LONG_EXPIRY_TIME })
    })

    it('returns a null token', async () => {
      const result = await server.methods.getChargingModuleToken()

      expect(result.accessToken).to.be.null()
    })

    it('does not cache the token', async () => {
      await server.methods.getChargingModuleToken()
      const secondCall = await server.methods.getChargingModuleToken()

      expect(secondCall.accessToken).to.equal('VALID_TOKEN')
    })
  })
})
