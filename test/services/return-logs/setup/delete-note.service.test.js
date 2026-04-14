'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

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

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('deletes the note from the session', async () => {
    await DeleteNoteService.go(session.id, yarStub)

    expect(session.note).to.be.undefined()
    expect(session.$update.called).to.be.true()
  })

  it('sets the notification message to "Deleted"', async () => {
    await DeleteNoteService.go(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.args[0]

    expect(flashType).to.equal('notification')
    expect(notification).to.equal({ titleText: 'Deleted', text: 'Note deleted' })
  })
})
