// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import DeleteNoteService from '../../../../app/services/return-versions/setup/delete-note.service.js'

describe('Return Versions Setup - Delete Note service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change',
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
    expect(notification).toEqual({ title: 'Deleted', text: 'Note deleted' })
  })
})
