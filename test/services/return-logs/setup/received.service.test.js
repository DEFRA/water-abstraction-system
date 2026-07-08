// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ReceivedService from '../../../../app/services/return-logs/setup/received.service.js'

describe('Return Logs - Setup - Received service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
      licenceId: '736144f1-203d-46bb-9968-5137ae06a7bd',
      returnLogId: '8280a3bb-aefb-4603-b71f-a58cef9169f3',
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
      const result = await ReceivedService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReceivedService(session.id)

      expect(result).toMatchObject({
        backLink: {
          href: '/system/return-logs/8280a3bb-aefb-4603-b71f-a58cef9169f3/details',
          text: 'Back'
        },
        pageTitle: 'When was the return received?',
        pageTitleCaption: 'Return reference 012345',
        receivedDateOption: null,
        receivedDateDay: null,
        receivedDateMonth: null,
        receivedDateYear: null
      })
    })
  })
})
