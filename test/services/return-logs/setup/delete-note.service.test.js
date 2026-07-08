'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const DeleteNoteService = require('../../../../app/services/return-logs/setup/delete-note.service.js')

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

    session = SessionModelStub.build(Sinon, sessionData)

    Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('deletes the note from the session', async () => {
    await DeleteNoteService(session.id, yarStub)

    expect(session.note).toBeUndefined()
    expect(session.$update.called).toBe(true)
  })

  it('sets the notification message to "Deleted"', async () => {
    await DeleteNoteService(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.args[0]

    expect(flashType).toEqual('notification')
    expect(notification).toEqual({ titleText: 'Deleted', text: 'Note deleted' })
  })
})
