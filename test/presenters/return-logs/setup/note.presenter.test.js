'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotePresenter = require('../../../../app/presenters/return-logs/setup/note.presenter.js')

describe('Return Logs Setup - Note presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      returnReference: '1234'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data without a note', () => {
      const result = NotePresenter.go(session)

      expect(result).to.be.equal({
        backLink: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        note: null,
        pageTitle: 'Add a note',
        caption: 'Return reference 1234',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "check" page', () => {
      const result = NotePresenter.go(session)

      expect(result.backLink).to.equal('/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check')
    })
  })

  describe('the "note" property', () => {
    describe('when the user has previously submitted a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to return log',
          userEmail: 'carol.shaw@atari.com'
        }
      })

      it('returns the contents of the note', () => {
        const result = NotePresenter.go(session)

        expect(result.note).to.equal('Note attached to return log')
      })
    })

    describe('when the user has not previously submitted a note', () => {
      it('returns an empty note', () => {
        const result = NotePresenter.go(session)

        expect(result.note).to.be.null()
      })
    })
  })
})
