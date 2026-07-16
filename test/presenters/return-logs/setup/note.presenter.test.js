// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import NotePresenter from '../../../../app/presenters/return-logs/setup/note.presenter.js'

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
      const result = NotePresenter(session)

      expect(result).to.be.toEqual({
        backLink: { href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check', text: 'Back' },
        note: null,
        pageTitle: 'Add a note',
        pageTitleCaption: 'Return reference 1234',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "check" page', () => {
      const result = NotePresenter(session)

      expect(result.backLink).toEqual({
        href: '/system/return-logs/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        text: 'Back'
      })
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
        const result = NotePresenter(session)

        expect(result.note).toEqual('Note attached to return log')
      })
    })

    describe('when the user has not previously submitted a note', () => {
      it('returns an empty note', () => {
        const result = NotePresenter(session)

        expect(result.note).toBeNull()
      })
    })
  })
})
