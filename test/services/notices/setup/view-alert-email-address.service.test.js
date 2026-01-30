'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const AbstractionAlertSessionData = require('../../../support/fixtures/abstraction-alert-session-data.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ViewAlertEmailAddressService = require('../../../../app/services/notices/setup/view-alert-email-address.service.js')

describe('Notices - Setup - View Alert Email Address service', () => {
  let auth
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

    sessionData = AbstractionAlertSessionData.get()
    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertEmailAddressService.go(session.id, auth)

      expect(result).to.equal({
        activeNavBar: 'notices',
        alertEmailAddressOptions: {
          otherUserChecked: false,
          otherUserEmailAddressInput: '',
          usernameChecked: false
        },
        backLink: {
          href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          text: 'Back'
        },
        pageTitle: 'Select an email address to include in the alerts',
        pageTitleCaption: 'Death star',
        username: 'admin@defra.gov.uk'
      })
    })
  })
})
