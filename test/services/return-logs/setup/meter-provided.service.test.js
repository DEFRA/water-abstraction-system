// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import MeterProvidedService from '../../../../app/services/return-logs/setup/meter-provided.service.js'

describe('Return Logs Setup - Meter Provided service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      returnReference: '012345'
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await MeterProvidedService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await MeterProvidedService(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/units`, text: 'Back' },
        meterProvided: null,
        pageTitle: 'Have meter details been provided?',
        pageTitleCaption: 'Return reference 012345'
      })
    })
  })
})
