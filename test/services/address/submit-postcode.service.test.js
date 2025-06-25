'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitPostcodeService = require('../../../app/services/address/submit-postcode.service.js')

describe('Address - Submit Postcode Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {
      address: {
        postcode: 'SW1A 1AA'
      }
    }
    sessionData = {
      address: {}
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called with a valid payload', () => {
    beforeEach(async () => {
      payload = {
        postcode: 'SW1A 1AA'
      }
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitPostcodeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.address.postcode).to.equal(payload.postcode)
    })

    it('continues on the journey', async () => {
      const result = await SubmitPostcodeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
      sessionData = {
        address: {}
      }

      session = await SessionHelper.add({ data: sessionData })
    })
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPostcodeService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'search',
        error: { text: 'Enter a UK postcode' },
        sessionId: session.id
      })
    })
  })
})
