'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const PostcodeService = require('../../../app/services/address/postcode.service.js')

describe('Address - Postcode Service', () => {
  let session
  let sessionData

  describe('when called and there is no session data', () => {
    beforeEach(async () => {
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await PostcodeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Enter a UK postcode',
        sessionId: session.id
      })
    })
  })

  describe('when called and there is session data', () => {
    beforeEach(async () => {
      sessionData = {
        address: {
          postcode: 'SW1A 1AA'
        }
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await PostcodeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Enter a UK postcode',
        postcode: 'SW1A 1AA',
        sessionId: session.id
      })
    })
  })
})
