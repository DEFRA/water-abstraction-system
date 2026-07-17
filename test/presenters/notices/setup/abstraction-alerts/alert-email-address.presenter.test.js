// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Thing under test
import AlertEmailAddressPresenter from '../../../../../app/presenters/notices/setup/abstraction-alerts/alert-email-address.presenter.js'

describe('Notices - Setup - Abstraction Alerts - Alert Email Address presenter', () => {
  let auth
  let session

  beforeEach(() => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    session = AbstractionAlertSessionData.get()
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AlertEmailAddressPresenter(session, auth)

      expect(result).toEqual({
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
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.otherUserChecked).toBe(true)
          })
        })

        describe('when the session.alertEmailAddressType does not equal "other"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.otherUserChecked).toBe(false)
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
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).toEqual('test@defra.gov.uk')
          })
        })

        describe('when "otherUserChecked" is false', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns an empty string', () => {
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.otherUserEmailAddressInput).toEqual('')
          })
        })
      })

      describe('the "usernameChecked" property', () => {
        describe('when the session.alertEmailAddressType equals "username"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'username'
          })

          it('returns true', () => {
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.usernameChecked).toBe(true)
          })
        })

        describe('when the session.alertEmailAddressType does not equal "username"', () => {
          beforeEach(() => {
            session.alertEmailAddressType = 'other'
          })

          it('returns false', () => {
            const result = AlertEmailAddressPresenter(session, auth)

            expect(result.alertEmailAddressOptions.usernameChecked).toBe(false)
          })
        })
      })
    })
  })
})
