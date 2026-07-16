// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCancelService from '../../../../../app/services/users/external/setup/view-cancel.service.js'

describe('Users - External - Setup - View Cancel Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCancelService(session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/external/setup/${session.id}/check`,
          text: 'Back'
        },
        licences: ['All licences'],
        pageTitle: 'You are about to cancel unregistering these licences',
        pageTitleCaption: session.user.username
      })
    })
  })
})
