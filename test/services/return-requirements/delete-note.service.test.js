'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const DeleteNoteService = require('../../../app/services/return-requirements/delete-note.service.js')

describe('Delete Note service', () => {
  const sessionData = {
    data: {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      checkYourAnswersVisited: true,
      licence: {
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Astro Boy',
        currentVersionStartDate: '2023-02-08T00:00:00.000Z'
      },
      reason: 'abstraction-below-100-cubic-metres-per-day',
      journey: 'no-returns-required',
      note: {
        content: 'Note attached to requirement',
        userEmail: 'carol.shaw@atari.com'
      },
      startDateOptions: 'licenceStartDate'
    }
  }

  let session
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      ...sessionData
    })

    yarStub = {
      flash: Sinon.stub()
    }
  })

  it('deletes the note', async () => {
    await DeleteNoteService.go(session.id, yarStub)
    expect(session.note).to.be.undefined()
  })

  it("sets the notification message to 'Removed'", async () => {
    await DeleteNoteService.go(session.id, yarStub)

    const [flashType, notification] = yarStub.flash.args[0]

    expect(flashType).to.equal('notification')
    expect(notification).to.equal({ title: 'Removed', text: 'Note removed' })
  })
})
