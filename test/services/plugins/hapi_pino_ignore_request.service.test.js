'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const HapiPinoIgnoreRequestService = require('../../../app/services/plugins/hapi_pino_ignore_request.service.js')

describe('Hapi Pino Ignore Request service', () => {
  const options = {}

  describe("when the request is for the root '/'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go(options, { path: '/' })

      expect(result).to.be.true()
    })
  })

  describe("when the request is for '/status'", () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go(options, { path: '/status' })

      expect(result).to.be.true()
    })
  })

  describe('when the request is for an asset', () => {
    it('returns true', () => {
      const result = HapiPinoIgnoreRequestService.go(options, { path: '/assets/stylesheets/application.css' })

      expect(result).to.be.true()
    })
  })

  describe("when the request is not for '/status' or an asset", () => {
    it('returns false', () => {
      const result = HapiPinoIgnoreRequestService.go(options, { path: '/bill-run/stuff' })

      expect(result).to.be.false()
    })
  })
})
