'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAlertEmailAddressService = require('../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js')

describe.only('Submit Alert Email Address Service', () => {
  let auth
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }
    payload = { alertEmailAddress: 'saved-email-address' }
    sessionData = AbstractionAlertSessionData.monitoringStation()

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAlertEmailAddressService.go(session.id, payload, auth)

      const refreshedSession = await session.$query()

      expect(refreshedSession.id).to.equal(session.id)
    })

    it('continues the journey', async () => {
      const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })
    it('returns page data for the view, with errors', async () => {
      const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

      expect(result).to.equal({
        caption: 'Death star',
        pageTitle: 'Select an email address to include in the alerts',
        error: {
          text: 'Select an email address to include in the alerts'
        },
        user: 'admin@defra.gov.uk'
      })
    })
  })
})
