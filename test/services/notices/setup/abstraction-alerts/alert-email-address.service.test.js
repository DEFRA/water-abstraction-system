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
const AlertEmailAddressService = require('../../../../../app/services/notices/setup/abstraction-alerts/alert-email-address.service.js')

describe.only('Alert Email Address Service', () => {
  let session
  let sessionData
  let auth

  beforeEach(async () => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    sessionData = AbstractionAlertSessionData.monitoringStation()
    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await AlertEmailAddressService.go(session.id, auth)

      expect(result).to.equal({
        caption: 'Death star',
        pageTitle: 'Select an email address to include in the alerts',
        radioItems: [
          {
            value: 'username',
            text: auth.credentials.user.username
          },
          {
            divider: 'or'
          },
          {
            value: 'other',
            text: 'Use another email address'
          }
        ]
      })
    })
  })
})
