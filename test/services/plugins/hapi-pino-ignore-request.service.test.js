const HapiPinoIgnoreRequestService = require('../../../app/services/plugins/hapi-pino-ignore-request.service.js')

describe('Hapi Pino Ignore Request service', () => {
  describe("when the request is for the root '/'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/' })
      expect(result).toBe(true)
    })
  })

  describe("when the request is for '/status'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/status' })
      expect(result).toBe(true)
    })
  })

  describe('when the request is for an asset', () => {
    describe('and LOG_ASSET_REQUESTS is false', () => {
      it('returns true', () => {
        const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/assets/stylesheets/application.css' })
        expect(result).toBe(true)
      })
    })

    describe('and LOG_ASSET_REQUESTS is true', () => {
      it('returns false', () => {
        const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: true }, { path: '/assets/stylesheets/application.css' })
        expect(result).toBe(false)
      })
    })
  })

  describe("when the request is not for '/status' or an asset", () => {
    it('returns false', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/bill-run/stuff' })
      expect(result).toBe(false)
    })
  })
})
