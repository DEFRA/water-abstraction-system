// Thing under test
import NotePresenter from '../../../../app/presenters/return-versions/setup/note.presenter.js'

describe('Return Versions Setup - Note presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
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
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data without a note', () => {
      const result = NotePresenter(session)

      expect(result).to.be.toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        },
        licenceRef: '01/ABC',
        note: null,
        pageTitle: 'Add a note',
        pageTitleCaption: 'Licence 01/ABC',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "check" page', () => {
      const result = NotePresenter(session)

      expect(result.backLink).toEqual({
        href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        text: 'Back'
      })
    })
  })

  describe('the "note" property', () => {
    describe('when the user has previously submitted a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to return requirement',
          userEmail: 'carol.shaw@atari.com'
        }
      })

      it('returns the contents of the note', () => {
        const result = NotePresenter(session)

        expect(result.note).toEqual('Note attached to return requirement')
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
