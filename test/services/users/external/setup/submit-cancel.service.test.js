// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../../app/services/users/external/setup/submit-cancel.service.js'

describe('Users - External - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub(sessionData)
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService(session.id)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })
  })
})
