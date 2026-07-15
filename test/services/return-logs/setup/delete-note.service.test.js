// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import DeleteNoteService from '../../../../app/services/return-logs/setup/delete-note.service.js'

describe('Return Logs Setup - Delete Note service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      returnReference: '1234',
      note: {
        content: 'I am not long for this world',
        userEmail: 'carol.shaw@atari.com'
      }
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('deletes the note from the session', async () => {
    await DeleteNoteService(session.id, yarStub)

    expect(session.note).toBeUndefined()
    expect(session.$update).toHaveBeenCalled()
  })

  it('sets the notification message to "Deleted"', async () => {
    await DeleteNoteService(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.mock.calls[0]

    expect(flashType).toEqual('notification')
    expect(notification).toEqual({ titleText: 'Deleted', text: 'Note deleted' })
  })
})
