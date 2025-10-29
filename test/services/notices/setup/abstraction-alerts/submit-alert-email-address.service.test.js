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

describe('Submit Alert Email Address Service', () => {
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

    payload = { alertEmailAddressType: 'username' }
    sessionData = AbstractionAlertSessionData.get()

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    describe('and the user selects the username as the email address', () => {
      it('saves the submitted value', async () => {
        await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertEmailAddress).to.equal('admin@defra.gov.uk')
      })

      it('continues the journey', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({})
      })
    })

    describe('and the user selects other value as the email address', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: 'test@defra.gov.uk' }
      })

      it('saves the submitted value', async () => {
        await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertEmailAddress).to.equal('test@defra.gov.uk')
      })

      it('continues the journey', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({})
      })
    })
  })

  describe('when validation fails', () => {
    describe('and the payload "alertEmailAddressType" is username', () => {
      it('updates the session "alertEmailAddress" property to the users username', async () => {
        await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertEmailAddress).to.equal(auth.credentials.user.username)
      })
    })

    describe('and the payload "alertEmailAddressType" is other', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: 'test@defra.go.uk' }
      })
      it('updates the session "alertEmailAddress" property to the payload "otherUser" value', async () => {
        await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        const refreshedSession = await session.$query()

        expect(refreshedSession.alertEmailAddress).to.equal('test@defra.go.uk')
      })
    })

    describe('because no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          activeNavBar: 'notices',
          alertEmailAddressOptions: {
            otherUserChecked: false,
            otherUserEmailAddressInput: '',
            usernameChecked: false
          },
          anchor: '#alertEmailAddress',
          backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormError: null,
            radioFormError: {
              text: 'Enter an email address'
            },
            text: 'Enter an email address'
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })

    describe('because other email has been selected but no email was provided', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: '' }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          activeNavBar: 'notices',
          alertEmailAddressOptions: {
            otherUserChecked: true,
            otherUserEmailAddressInput: '',
            usernameChecked: false
          },
          anchor: '#otherUser',
          backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormError: {
              text: 'Enter an email address'
            },
            radioFormError: null,
            text: 'Enter an email address'
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })

    describe('because other email has been selected but an invalid email was provided', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: '123123123' }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          activeNavBar: 'notices',
          alertEmailAddressOptions: {
            otherUserChecked: true,
            otherUserEmailAddressInput: '123123123',
            usernameChecked: false
          },
          anchor: '#otherUser',
          backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormError: {
              text: 'Enter an email address in the correct format, like name@example.com'
            },
            radioFormError: null,
            text: 'Enter an email address in the correct format, like name@example.com'
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })
  })
})
