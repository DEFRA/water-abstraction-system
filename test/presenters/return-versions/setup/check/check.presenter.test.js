'use strict'

// Thing under test
const CheckPresenter = require('../../../../../app/presenters/return-versions/setup/check/check.presenter.js')

describe('Return Versions Setup - Check presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: '61e07498-f309-4829-96a9-72084a54996d',
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      multipleUpload: false,
      returnVersionStartDate: '2023-01-01',
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = CheckPresenter(session)

      expect(result).toEqual({
        licenceRef: '01/ABC',
        multipleUpload: false,
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        pageTitle: 'Check the requirements for returns for Turbo Kid',
        pageTitleCaption: 'Licence 01/ABC',
        quarterlyReturnSubmissions: false,
        quarterlyReturns: undefined,
        reason: 'Major change',
        reasonLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 January 2023'
      })
    })
  })

  describe('the "multipleUpload" property', () => {
    describe('when there is a multipleUpload', () => {
      beforeEach(() => {
        session.multipleUpload = true
      })

      it('returns the value', () => {
        const result = CheckPresenter(session)

        expect(result.multipleUpload).toBe(true)
      })
    })

    describe('when there is not a multipleUpload', () => {
      it('returns the value', () => {
        const result = CheckPresenter(session)

        expect(result.multipleUpload).toBe(false)
      })
    })
  })

  describe('the "quarterlyReturns" property', () => {
    describe('when there is a quarterlyReturns', () => {
      beforeEach(() => {
        session.quarterlyReturns = true
      })

      it('returns true', () => {
        const result = CheckPresenter(session)

        expect(result.quarterlyReturns).toBe(true)
      })
    })

    describe('when there is not a quarterlyReturns', () => {
      beforeEach(() => {
        session.quarterlyReturns = false
      })

      it('returns false', () => {
        const result = CheckPresenter(session)

        expect(result.quarterlyReturns).toBe(false)
      })
    })

    describe('when quarterlyReturns has not been set', () => {
      it('returns undefined', () => {
        const result = CheckPresenter(session)

        expect(result.quarterlyReturns).toBeUndefined()
      })
    })
  })

  describe('the "quarterlyReturnSubmissions" property', () => {
    describe('when the return version start date is for quarterly returns', () => {
      beforeEach(() => {
        session.returnVersionStartDate = '2025-04-01'
      })

      it('returns true', () => {
        const result = CheckPresenter(session)

        expect(result.quarterlyReturnSubmissions).toBe(true)
      })
    })

    describe('when the return version start date is not for quarterly returns', () => {
      beforeEach(() => {
        session.returnVersionStartDate = '2001-01-01'
      })

      it('returns false', () => {
        const result = CheckPresenter(session)

        expect(result.quarterlyReturnSubmissions).toBe(false)
      })
    })
  })

  describe('the "note" property', () => {
    describe('when the user has added a note', () => {
      beforeEach(() => {
        session.note = {
          content: 'Note attached to requirement'
        }
      })

      it('returns text with the note content and the change and delete a note action', () => {
        const result = CheckPresenter(session)

        expect(result.note).toEqual({
          actions: [
            {
              href: 'note',
              text: 'Change'
            },
            {
              href: 'delete-note',
              text: 'Delete'
            }
          ],
          text: 'Note attached to requirement'
        })
      })
    })

    describe('when the user has not added a note', () => {
      it('returns text with "No notes added" and the add a note action', () => {
        const result = CheckPresenter(session)

        expect(result.note).toEqual({
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        })
      })
    })
  })

  describe('the "pageTitle" property', () => {
    it('returns the page title combined with the licence holder name', () => {
      const result = CheckPresenter(session)

      expect(result.pageTitle).toEqual('Check the requirements for returns for Turbo Kid')
      expect(result.pageTitleCaption).toEqual('Licence 01/ABC')
    })
  })

  describe('the "reason" property', () => {
    it('returns the display version for the reason', () => {
      const result = CheckPresenter(session)

      expect(result.reason).toEqual('Major change')
    })
  })

  describe('the "reasonLink" property', () => {
    describe('when the journey is for returns required', () => {
      it('returns a link to the "reason" page', () => {
        const result = CheckPresenter(session)

        expect(result.reasonLink).toEqual('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/reason')
      })
    })

    describe('when the journey is for no returns required', () => {
      beforeEach(() => {
        session.journey = 'no-returns-required'
      })

      it('returns a link to the "no-returns-required" page', () => {
        const result = CheckPresenter(session)

        expect(result.reasonLink).toEqual(
          '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/no-returns-required'
        )
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when the user has previously selected the licence start date as the start date', () => {
      it('returns the licence version start date formatted as a long date', () => {
        const result = CheckPresenter(session)

        expect(result.startDate).toEqual('1 January 2023')
      })
    })

    describe('when the user has previously selected another date as the start date', () => {
      beforeEach(() => {
        session.returnVersionStartDate = '2023-11-26'
      })

      it('returns the start date parts formatted as a long date', () => {
        const result = CheckPresenter(session)

        expect(result.startDate).toEqual('26 November 2023')
      })
    })
  })
})
