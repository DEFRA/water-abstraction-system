'use strict'

// Things we need to stub
const ChargingModuleTokenService = require('../../app/services/charging-module/token.service')

// For running our service
const { init } = require('../../app/server.js')

describe('Charging Module Token Cache plugin', () => {
  const LONG_EXPIRY_TIME = 3600
  const SHORT_EXPIRY_TIME = 1

  let tokenServiceMock
  let server

  beforeEach(async () => {
    // Create server before each test
    server = await init()

    // Mock the function 'go' of ChargingModuleTokenService
    tokenServiceMock = jest.spyOn(ChargingModuleTokenService, 'go')
  })

  afterEach(async () => {
    await server.stop()

    jest.restoreAllMocks()
  })

  describe('When the first call returns a valid token', () => {
    describe('and the second request is made before the cache expires', () => {
      beforeEach(() => {
        // Chain the mockResolvedValue calls for different calls to 'go'
        tokenServiceMock
          .mockResolvedValueOnce({ accessToken: 'FIRST_TOKEN', expiresIn: LONG_EXPIRY_TIME })
          .mockResolvedValueOnce({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
      })

      it('returns the cached token', async () => {
        const firstCall = await server.methods.getChargingModuleToken()
        const secondCall = await server.methods.getChargingModuleToken()

        expect(firstCall.accessToken).toEqual('FIRST_TOKEN')
        expect(secondCall.accessToken).toEqual('FIRST_TOKEN')
      })
    })

    describe('and the second request is made after the cache expires', () => {
      beforeEach(() => {
        tokenServiceMock
          .mockResolvedValueOnce({ accessToken: 'FIRST_TOKEN', expiresIn: SHORT_EXPIRY_TIME })
          .mockResolvedValueOnce({ accessToken: 'SECOND_TOKEN', expiresIn: LONG_EXPIRY_TIME })
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
      tokenServiceMock
        .mockResolvedValueOnce({ accessToken: null, expiresIn: null })
        .mockResolvedValueOnce({ accessToken: 'VALID_TOKEN', expiresIn: LONG_EXPIRY_TIME })
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
