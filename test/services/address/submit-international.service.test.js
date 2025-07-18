'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitInternationalService = require('../../../app/services/address/submit-international.service.js')

describe.skip('Address - International Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {}
    sessionData = {
      address: {}
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    beforeEach(async () => {
      payload = {
        addressLine1: '1 Fake Farm'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitInternationalService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data).to.equal({
        address: {}
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitInternationalService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitInternationalService.go(session.id, payload)

      expect(result).to.equal({
        error: {
          text: 'Enter address line 1'
        }
      })
    })
  })
})
