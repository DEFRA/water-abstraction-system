'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../../fixtures/abstraction-alert-session-data.fixture.js')

// Thing under test
const AlertEmailAddressPresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js')

describe('Alert Email Address Presenter', () => {
  let session
  let auth

  beforeEach(() => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    session = AbstractionAlertSessionData.monitoringStation()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertEmailAddressPresenter.go(session, auth)

      expect(result).to.equal({
        caption: 'Death star',
        pageTitle: 'Select an email address to include in the alerts',
        user: 'admin@defra.gov.uk'
      })
    })
  })
})
