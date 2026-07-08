// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import DeleteSessionDal from '../../../../app/dal/delete-session.dal.js'

// Thing under test
import SubmitCancelService from '../../../../app/services/return-versions/setup/submit-cancel.service.js'

describe('Return Versions Setup - Submit Cancel service', () => {
  let session

  beforeEach(() => {
    session = SessionModelStub({})

    vi.mock('../../../../app/dal/delete-session.dal.js')
    DeleteSessionDal.mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a user submits the return requirements to be cancelled', () => {
    it('deletes the session data', async () => {
      await SubmitCancelService(session.id)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })
  })
})
