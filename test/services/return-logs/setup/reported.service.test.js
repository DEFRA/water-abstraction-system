// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ReportedService from '../../../../app/services/return-logs/setup/reported.service.js'

describe('Return Logs Setup - Reported service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ReportedService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReportedService(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/submission`, text: 'Back' },
        pageTitle: 'How was this return reported?',
        pageTitleCaption: 'Return reference 012345',
        reported: null
      })
    })
  })
})
