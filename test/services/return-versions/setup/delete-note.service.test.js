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
const DeleteNoteService = require('../../../../app/services/return-versions/setup/delete-note.service.js')

describe('Return Versions Setup - Delete Note service', () => {
  let session
  let yarStub

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
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

  it('sets the notification message to "Removed"', async () => {
    await DeleteNoteService.go(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.args[0]

    expect(flashType).to.equal('notification')
    expect(notification).to.equal({ title: 'Removed', text: 'Note removed' })
  })
})
