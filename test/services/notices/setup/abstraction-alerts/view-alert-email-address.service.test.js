// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import AbstractionAlertSessionData from '../../../../support/fixtures/abstraction-alert-session-data.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewAlertEmailAddressService from '../../../../../src/services/notices/setup/abstraction-alerts/view-alert-email-address.service.js'

describe('Notices - Setup - Abstraction Alerts - View Alert Email Address service', () => {
  let auth
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

    sessionData = AbstractionAlertSessionData.get()
    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewAlertEmailAddressService(session.id, auth)

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
        username: 'admin@defra.gov.uk'
      })
    })
  })
})
