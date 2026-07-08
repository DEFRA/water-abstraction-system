// Test framework dependencies

// Test helpers
import * as UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../../app/services/users/external/setup/submit-cancel.service.js'

describe('Users - External - Setup - Submit Cancel service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub(sessionData)
    vi.mock('../../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    vi.mock('../../../../../app/dal/delete-session.dal.js')
    DeleteSessionDal.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('clears the session', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })

    it('returns the redirect url', async () => {
      const result = await SubmitCancelService(session.id)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })
  })
})
