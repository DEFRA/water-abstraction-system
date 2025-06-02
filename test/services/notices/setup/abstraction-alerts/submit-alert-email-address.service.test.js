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
    payload = { alertEmailAddress: 'username' }
    sessionData = AbstractionAlertSessionData.monitoringStation()

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
        payload = { alertEmailAddress: 'other', otherUser: 'test@defra.gov.uk' }
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
    describe('because no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormElement: null,
            radioFormElement: {
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
        payload = { alertEmailAddress: 'other', otherUser: '' }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormElement: {
              text: 'Enter an email address'
            },
            radioFormElement: null,
            text: 'Enter an email address'
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })

    describe('because other email has been selected but an invalid email was provided', () => {
      beforeEach(() => {
        payload = { alertEmailAddress: 'other', otherUser: '123123123' }
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService.go(session.id, payload, auth)

        expect(result).to.equal({
          caption: 'Death star',
          pageTitle: 'Select an email address to include in the alerts',
          error: {
            emailAddressInputFormElement: {
              text: 'Enter an email address in the correct format, like name@example.com'
            },
            radioFormElement: null,
            text: 'Enter an email address in the correct format, like name@example.com'
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })
  })
})
