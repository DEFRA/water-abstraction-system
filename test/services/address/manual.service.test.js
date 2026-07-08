// Test framework dependencies

// Test helpers
import SessionModelStub from '../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../app/dal/fetch-session.dal.js'

// Thing under test
import ManualService from '../../../app/services/address/manual.service.js'

describe('Address - Manual Service', () => {
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      id: sessionId,
      addressJourney: {
        activeNavBar: 'manage',
        address: { postcode: 'SW1A 1AA' },
        backLink: {
          href: `/system/notices/setup/${sessionId}/contact-type`,
          text: 'Back'
        },
        redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`
      }
    }

    session = SessionModelStub(sessionData)

    vi.mock('../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ManualService(sessionId)

      expect(result).toEqual({
        activeNavBar: 'manage',
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        backLink: {
          href: `/system/address/${sessionId}/postcode`,
          text: 'Back'
        },
        pageTitle: 'Enter the address',
        pageTitleCaption: null,
        postcode: 'SW1A 1AA'
      })
    })
  })
})
