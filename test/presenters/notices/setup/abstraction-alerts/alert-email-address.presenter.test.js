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
  let auth
  let session
  let validationResult

  beforeEach(() => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    validationResult = null
    session = AbstractionAlertSessionData.get()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

      expect(result).to.equal({
        anchor: null,
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
        caption: 'Death star',
        pageTitle: 'Select an email address to include in the alerts',
        username: 'admin@defra.gov.uk'
      })
    })

    describe('the "anchor" property', () => {
      describe('when the validation result is null', () => {
        it('returns null', () => {
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

          expect(result.anchor).to.equal(null)
        })
      })

      describe('when the validation result contains a radioFormError', () => {
        beforeEach(() => {
          validationResult = {
            radioFormError: {
              text: 'Enter an email address'
            }
          }
        })

        it('returns the ancho "#alertEmailAddress"', () => {
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

          expect(result.anchor).to.equal('#alertEmailAddress')
        })
      })

      describe('when the validation result contains a emailAddressInputFormError', () => {
        beforeEach(() => {
          validationResult = {
            emailAddressInputFormError: {
              text: 'Enter an email address'
            }
          }
        })

        it('returns the ancho "#otherUser"', () => {
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

          expect(result.anchor).to.equal('#otherUser')
        })
      })
    })
  })
})
