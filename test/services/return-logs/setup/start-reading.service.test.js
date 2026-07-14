// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import StartReadingService from '../../../../app/services/return-logs/setup/start-reading.service.js'

describe('Return Logs Setup - Start Reading service', () => {
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
      const result = await StartReadingService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await StartReadingService(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/reported`, text: 'Back' },
        pageTitle: 'Enter the start meter reading',
        pageTitleCaption: 'Return reference 012345',
        startReading: null
      })
    })
  })
})
