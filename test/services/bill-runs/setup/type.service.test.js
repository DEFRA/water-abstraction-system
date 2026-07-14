// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import TypeService from '../../../../app/services/bill-runs/setup/type.service.js'

describe('Bill Runs - Setup - Type service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { type: 'annual' }
    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await TypeService(session.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: '/system/bill-runs',
        pageTitle: 'Select the bill run type',
        sessionId: session.id,
        selectedType: 'annual'
      })
    })
  })
})
