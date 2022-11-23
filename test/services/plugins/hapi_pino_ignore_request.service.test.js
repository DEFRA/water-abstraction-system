'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const LogConfig = require('../../../config/log.config.js')

// Thing under test
const HapiPinoIgnoreRequestService = require('../../../app/services/plugins/hapi_pino_ignore_request.service.js')

describe('Hapi Pino Ignore Request service', () => {
  const _options = {}

  afterEach(() => {
    Sinon.restore()
  })

  describe("when the request is for the root '/'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go(_options, { path: '/' })

      expect(result).to.be.true()
    })
  })

  describe("when the request is for '/status'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go(_options, { path: '/status' })

      expect(result).to.be.true()
    })
  })

  describe('when the request is for an asset', () => {
    describe('and LOG_ASSET_REQUESTS is false', () => {
      beforeEach(() => {
        Sinon.replace(LogConfig, 'logAssetRequests', false)
      })

      it('returns true', () => {
        const result = HapiPinoIgnoreRequestService.go(_options, { path: '/assets/stylesheets/application.css' })

        expect(result).to.be.true()
      })
    })

    describe('and LOG_ASSET_REQUESTS is true', () => {
      beforeEach(() => {
        Sinon.replace(LogConfig, 'logAssetRequests', true)
      })

      it('returns false', () => {
        const result = HapiPinoIgnoreRequestService.go(_options, { path: '/assets/stylesheets/application.css' })

        expect(result).to.be.false()
      })
    })
  })

  describe("when the request is not for '/status' or an asset", () => {
    it('returns false', () => {
      const result = HapiPinoIgnoreRequestService.go(_options, { path: '/bill-run/stuff' })

      expect(result).to.be.false()
    })
  })
})
