'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const HapiPinoIgnoreRequestService = require('../../../app/services/plugins/hapi-pino-ignore-request.service.js')

describe('Hapi Pino Ignore Request service', () => {
  describe('when the request is for the root "/"', () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/' })

      expect(result).to.be.true()
    })
  })

  describe('when the request is for "/status"', () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/status' })

      expect(result).to.be.true()
    })
  })

  describe('when the request is for "/import/licence/legacy"', () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/import/licence/legacy' })

      expect(result).to.be.true()
    })
  })

  describe('when the request is for an asset', () => {
    describe('and LOG_ASSET_REQUESTS is false', () => {
      it('returns true', () => {
        const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/assets/stylesheets/application.css' })

        expect(result).to.be.true()
      })
    })

    describe('and LOG_ASSET_REQUESTS is true', () => {
      it('returns false', () => {
        const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: true }, { path: '/assets/stylesheets/application.css' })

        expect(result).to.be.false()
      })
    })
  })

  describe('when the request is not for "/status" or an asset', () => {
    it('returns false', () => {
      const result = HapiPinoIgnoreRequestService.go({ logAssetRequests: false }, { path: '/bill-run/stuff' })

      expect(result).to.be.false()
    })
  })
})
