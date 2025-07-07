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

  describe('when called with a invalid payload', () => {
    describe('when there is no value provided', () => {
      beforeEach(async () => {
        payload = {}
        sessionData = {
          address: {}
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns the page data with an appropriate error', async () => {
        const result = await SubmitPostcodeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Enter a UK postcode',
          error: { text: 'Enter a UK postcode' },
          sessionId: session.id
        })
      })
    })

    describe('when there is an invalid value provided', () => {
      beforeEach(async () => {
        payload = { postcode: 'notapostcode' }
        sessionData = {
          address: {}
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns the page data with an appropriate error', async () => {
        const result = await SubmitPostcodeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Enter a UK postcode',
          postcode: 'notapostcode',
          error: { text: 'Enter a valid UK postcode' },
          sessionId: session.id
        })
      })
    })
  })
})
