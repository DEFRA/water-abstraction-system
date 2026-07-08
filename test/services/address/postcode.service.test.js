// Test framework dependencies

// Test helpers
import SessionModelStub from '../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../app/dal/fetch-session.dal.js'

// Thing under test
import PostcodeService from '../../../app/services/address/postcode.service.js'

describe('Address - Postcode Service', () => {
  const sessionId = 'dba48385-9fc8-454b-8ec8-3832d3b9e323'

  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      id: sessionId,
      addressJourney: {
        activeNavBar: 'manage',
        address: {},
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
      const result = await PostcodeService(sessionId)

      expect(result).toEqual({
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${sessionId}/contact-type`,
          text: 'Back'
        },
        internationalLink: `/system/address/${sessionId}/international`,
        pageTitle: 'Enter a UK postcode',
        pageTitleCaption: null,
        postcode: null
      })
    })
  })
})
