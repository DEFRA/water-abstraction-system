// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAlertEmailAddressService from '../../../../../app/services/notices/setup/abstraction-alerts/submit-alert-email-address.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Alert Email Address service', () => {
  let auth
  let payload
  let session
  let sessionData

  beforeEach(() => {
    auth = {
      credentials: {
        user: {
          username: 'admin@defra.gov.uk'
        }
      }
    }

    payload = { alertEmailAddressType: 'username' }
    sessionData = AbstractionAlertSessionData.get()

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('and the user selects the username as the email address', () => {
      it('saves the submitted value', async () => {
        await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(session.alertEmailAddress).toEqual('admin@defra.gov.uk')
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(result).toEqual({})
      })
    })

    describe('and the user selects other value as the email address', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: 'test@defra.gov.uk' }
      })

      it('saves the submitted value', async () => {
        await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(session.alertEmailAddress).toEqual('test@defra.gov.uk')
        expect(session.$update).toHaveBeenCalled()
      })

      it('continues the journey', async () => {
        const result = await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(result).toEqual({})
      })
    })
  })

  describe('when validation fails', () => {
    describe('and the payload "alertEmailAddressType" is username', () => {
      it('updates the session "alertEmailAddress" property to the users username', async () => {
        await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(session.alertEmailAddress).toEqual(auth.credentials.user.username)
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('and the payload "alertEmailAddressType" is other', () => {
      beforeEach(() => {
        payload = { alertEmailAddressType: 'other', otherUser: 'test@defra.go.uk' }
      })
      it('updates the session "alertEmailAddress" property to the payload "otherUser" value', async () => {
        await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(session.alertEmailAddress).toEqual('test@defra.go.uk')
        expect(session.$update).toHaveBeenCalled()
      })
    })

    describe('because no option has been selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(result).toEqual({
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
          error: {
            alertEmailAddressType: {
              text: 'Enter an email address'
            },
            errorList: [
              {
                href: '#alertEmailAddressType',
                text: 'Enter an email address'
              }
            ]
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
        const result = await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(result).toEqual({
          activeNavBar: 'notices',
          alertEmailAddressOptions: {
            otherUserChecked: true,
            otherUserEmailAddressInput: '',
            usernameChecked: false
          },
          backLink: {
            href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
            text: 'Back'
          },
          pageTitle: 'Select an email address to include in the alerts',
          pageTitleCaption: 'Death star',
          error: {
            errorList: [
              {
                href: '#otherUser',
                text: 'Enter an email address'
              }
            ],
            otherUser: {
              text: 'Enter an email address'
            }
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
        const result = await SubmitAlertEmailAddressService(session.id, payload, auth)

        expect(result).toEqual({
          activeNavBar: 'notices',
          alertEmailAddressOptions: {
            otherUserChecked: true,
            otherUserEmailAddressInput: '123123123',
            usernameChecked: false
          },
          backLink: {
            href: `/system/notices/setup/${session.id}/abstraction-alerts/check-licence-matches`,
            text: 'Back'
          },
          pageTitle: 'Select an email address to include in the alerts',
          pageTitleCaption: 'Death star',
          error: {
            errorList: [
              {
                href: '#otherUser',
                text: 'Enter an email address in the correct format, like name@example.com'
              }
            ],
            otherUser: {
              text: 'Enter an email address in the correct format, like name@example.com'
            }
          },
          username: 'admin@defra.gov.uk'
        })
      })
    })
  })
})
