'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SubmitManualService = require('../../../app/services/address/submit-manual.service.js')

describe.skip('Address - Manual Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = {
      addressLine1: '1 Fake street'
    }
    sessionData = {
      address: {}
    }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    beforeEach(async () => {
      payload = {
        addressLine1: '1 Fake street'
      }
    })

    it('saves the submitted value', async () => {
      await SubmitManualService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
    })

    it('continues the journey', async () => {
      const result = await SubmitManualService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitManualService.go(session.id, payload)

      expect(result).to.equal({
        error: {
          text: 'Enter addresss line 1'
        },
        pageTitle: 'Enter the address'
      })
    })
  })
})
