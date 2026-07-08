// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import NoteService from '../../../../app/services/return-logs/setup/note.service.js'

describe('Return Logs Setup - Note service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { returnReference: '1234' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await NoteService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await NoteService(session.id)

      expect(result).toEqual({
        backLink: {
          href: `/system/return-logs/setup/${session.id}/check`,
          text: 'Back'
        },
        note: null,
        pageTitle: 'Add a note',
        pageTitleCaption: 'Return reference 1234',
        sessionId: session.id
      })
    })
  })
})
