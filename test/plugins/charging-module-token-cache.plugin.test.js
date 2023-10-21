'use strict'

const Sinon = require('sinon')
const ChargingModuleTokenService = require('../../app/services/charging-module/token.service')
const { init } = require('../../app/server.js')

const LONG_EXPIRY_TIME = 3600
const SHORT_EXPIRY_TIME = 1

describe('Charging Module Token Cache plugin', () => {
  let server

  beforeEach(async () => {
    server = await init()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('When the first call returns a valid token', () => {
    describe('and the second request is made before the cache expires', () => {
      beforeAll(() => {
        Sinon.stub(ChargingModuleTokenService, 'go')
          .onFirstCall().resolves({ accessToken: 'FIRST_TOKEN', expiresIn: LONG_EXPIRY_TIME })
          .onSecondCall().resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns the cached token', async () => {
        const firstCall = await server.methods.getChargingModuleToken()
        const secondCall = await server.methods.getChargingModuleToken()

        expect(firstCall.accessToken).toEqual('FIRST_TOKEN')
        expect(secondCall.accessToken).toEqual('FIRST_TOKEN')
      })
    })

    describe('and the second request is made after the cache expires', () => {
      beforeAll(() => {
        Sinon.stub(ChargingModuleTokenService, 'go')
          .onFirstCall().resolves({ accessToken: 'FIRST_TOKEN', expiresIn: SHORT_EXPIRY_TIME })
          .onSecondCall().resolves({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns a new token', async () => {
        await server.methods.getChargingModuleToken()
        const result = await server.methods.getChargingModuleToken()

        expect(result.accessToken).toEqual('SECOND_TOKEN')
      })
    })
  })

  describe('When the first call returns an invalid token', () => {
    beforeEach(() => {
      Sinon.stub(ChargingModuleTokenService, 'go')
        .onFirstCall().resolves({ accessToken: null, expiresIn: null })
        .onSecondCall().resolves({ accessToken: 'VALID_TOKEN', expiresIn: LONG_EXPIRY_TIME })
    })

    it('returns a null token', async () => {
      const result = await server.methods.getChargingModuleToken()

      expect(result.accessToken).toBeNull()
    })

    it('does not cache the token', async () => {
      await server.methods.getChargingModuleToken()
      const secondCall = await server.methods.getChargingModuleToken()

      expect(secondCall.accessToken).toEqual('VALID_TOKEN')
    })
  })
})
