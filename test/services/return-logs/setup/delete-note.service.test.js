'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const DeleteNoteService = require('../../../../app/services/return-logs/setup/delete-note.service.js')

describe('Return Logs Setup - Delete Note service', () => {
  let session
  let yarStub

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        returnReference: '1234',
        note: {
          content: 'I am not long for this world',
          userEmail: 'carol.shaw@atari.com'
        }
      }
    })

    yarStub = {
      flash: Sinon.stub()
    }
  })

  it('deletes the note from the session', async () => {
    await DeleteNoteService.go(session.id, yarStub)

    const refreshedSession = await session.$query()

    expect(refreshedSession.note).to.be.undefined()
  })

  it('sets the notification message to "Deleted"', async () => {
    await DeleteNoteService.go(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.args[0]

    expect(flashType).to.equal('notification')
    expect(notification).to.equal({ title: 'Deleted', titleText: 'Deleted', text: 'Note deleted' })
  })
})
