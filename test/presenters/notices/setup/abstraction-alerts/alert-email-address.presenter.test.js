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
  let payload
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

    payload = { alertEmailAddress: 'username' }

    validationResult = null
    session = AbstractionAlertSessionData.get()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

      expect(result).to.equal({
        alertEmailAddressOptions: {
          otherUserChecked: false,
          otherUserEmailAddressInput: '',
          usernameChecked: true
        },
        anchor: null,
        backLink: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
        caption: 'Death star',
        pageTitle: 'Select an email address to include in the alerts',
        username: 'admin@defra.gov.uk'
      })
    })

    describe('the "alertEmailAddressOptions" property', () => {
      describe('the "usernameChecked" property', () => {
        describe('when the username matches the session.alertEmailAddress', () => {
          beforeEach(() => {
            session.alertEmailAddress = 'admin@defra.gov.uk'
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.usernameChecked).to.be.true()
          })
        })

        describe('when the payload.alertEmailAddress equals the username', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'username' }
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.usernameChecked).to.be.true()
          })
        })

        describe('when the payload.alertEmailAddress does not equal "username" and session.alertEmailAddress does not match the username', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'other' }
            session.alertEmailAddress = 'test@defra.gov.uk'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.usernameChecked).to.be.false()
          })
        })
      })

      describe('the "otherUserChecked" property', () => {
        describe('when the payload.alertEmailAddress equals "other"', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'other' }
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.otherUserChecked).to.be.true()
          })
        })

        describe('when the session.alertEmailAddress does not equal the username', () => {
          beforeEach(() => {
            session.alertEmailAddress = 'test@defra.gov.uk'
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.otherUserChecked).to.be.true()
          })
        })

        describe('when the payload.alertEmailAddress does not equal other and the session.alertEmailAddress equals the username', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'username' }
            session.alertEmailAddress = 'admin@defra.gov.uk'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.otherUserChecked).to.be.false()
          })
        })
      })

      describe('the "otherUserEmailAddressInput" property', () => {
        describe('when "otherUserChecked" is true and there is session.alertEmailAddress', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'other' }
            session.alertEmailAddress = 'test@defra.gov.uk'
          })

          it('returns the session.alertEmailAddress', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).to.equal('test@defra.gov.uk')
          })
        })

        describe('when "otherUserChecked" is false or there is no session.alertEmailAddress', () => {
          beforeEach(() => {
            payload = { alertEmailAddress: 'username' }
            session.alertEmailAddress = null
          })

          it('returns an empty string', () => {
            const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).to.equal('')
          })
        })
      })
    })

    describe('the "anchor" property', () => {
      describe('when the validation result is null', () => {
        it('returns null', () => {
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

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
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

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
          const result = AlertEmailAddressPresenter.go(session, auth, validationResult, payload)

          expect(result.anchor).to.equal('#otherUser')
        })
      })
    })
  })
})
