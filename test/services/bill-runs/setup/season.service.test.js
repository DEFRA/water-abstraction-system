// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SeasonService from '../../../../app/services/bill-runs/setup/season.service.js'

describe('Bill Runs - Setup - Type service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { season: 'summer' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await SeasonService(session.id)

      expect(result).toEqual({
        activeNavBar: 'bill-runs',
        backlink: `/system/bill-runs/setup/${session.id}/year`,
        pageTitle: 'Select the season',
        sessionId: session.id,
        selectedSeason: 'summer'
      })
    })
  })
})
