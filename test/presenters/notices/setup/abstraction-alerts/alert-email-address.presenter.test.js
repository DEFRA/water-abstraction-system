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

    describe('the "alertEmailAddressOptions" property', () => {
      describe('the "otherUserChecked" property', () => {
        describe('when the session.alertEmailAddressType equals "other"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'other'
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.otherUserChecked).to.be.true()
          })
        })

        describe('when the session.alertEmailAddressType does not equal "other"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.otherUserChecked).to.be.false()
          })
        })
      })

      describe('the "otherUserEmailAddressInput" property', () => {
        describe('when "otherUserChecked" is true', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'other'
            session.alertEmailAddress = 'test@defra.gov.uk'
          })

          it('returns the session.alertEmailAddress', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).to.equal('test@defra.gov.uk')
          })
        })

        describe('when "otherUserChecked" is false', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns an empty string', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).to.equal('')
          })
        })
      })

      describe('the "usernameChecked" property', () => {
        describe('when the session.alertEmailAddressType equals "username"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.usernameChecked).to.be.true()
          })
        })

        describe('when the session.alertEmailAddressType does not equal "username"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'other'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult)

            expect(result.alertEmailAddressOptions.usernameChecked).to.be.false()
          })
        })
      })
    })
  })
})
