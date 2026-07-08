// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import MeterDetailsService from '../../../../app/services/return-logs/setup/meter-details.service.js'

describe('Return Logs Setup - Meter Details service', () => {
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
      const result = await MeterDetailsService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await MeterDetailsService(session.id)

      expect(result).toMatchObject({
        backLink: { href: `/system/return-logs/setup/${session.id}/meter-provided`, text: 'Back' },
        meterMake: null,
        meterSerialNumber: null,
        meter10TimesDisplay: null,
        pageTitle: 'Meter details',
        pageTitleCaption: 'Return reference 012345'
      })
    })
  })
})
