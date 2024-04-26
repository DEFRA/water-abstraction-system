'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CheckYourAnswersPresenter = require('../../../app/presenters/return-requirements/check-your-answers.presenter.js')

describe('Check Your Answers presenter', () => {
  let session

  beforeEach(() => {
    session = {
      id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
      data: {
        licence: {
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Astro Boy'

        },
        journey: 'no-returns-required',
        note: {
          content: 'Note attached to requirement',
          userEmail: 'carol.shaw@atari.com'
        },
        reason: 'returns-exception',
        startDateOptions: 'licenceStartDate'
      }
    }
  })

  describe('when the no-returns-required journey was selected', () => {
    it('correctly presents the data with notes', () => {
      const result = CheckYourAnswersPresenter.go(session)

      expect(result).to.equal({
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        journey: 'no-returns-required',
        licenceRef: '01/123',
        note: 'Note attached to requirement',
        reason: 'returns-exception',
        startDate: '1 January 2023',
        userEmail: 'carol.shaw@atari.com'
      })
    })
  })

  describe("the 'note' property", () => {
    describe('when there is a note', () => {
      it('returns the contents of the note', () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.note).to.equal('Note attached to requirement')
      })
    })

    describe('when there is no note', () => {
      beforeEach(() => {
        delete session.data.note
      })

      it('returns an empty string', () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.note).to.equal('')
      })
    })
  })

  describe("the 'startDate' property", () => {
    describe("when the user selected the option 'anotherStartDate'", () => {
      beforeEach(() => {
        session.data.startDateOptions = 'anotherStartDate'

        session.data.startDateDay = '07'
        session.data.startDateMonth = '03'
        session.data.startDateYear = '2009'
      })

      it('returns the start day, month and year entered combined as a date', () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.startDate).to.equal('7 March 2009')
      })
    })

    describe("when the user selected the option 'licenceStartDate'", () => {
      it("returns the licence's current version start date", () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.startDate).to.equal('1 January 2023')
      })
    })
  })

  describe("the 'userEmail' property", () => {
    describe('when there is a note', () => {
      it('returns the user email on the note', () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.userEmail).to.equal('carol.shaw@atari.com')
      })
    })

    describe('when there is no note', () => {
      beforeEach(() => {
        delete session.data.note
      })

      it("returns 'No notes added'", () => {
        const result = CheckYourAnswersPresenter.go(session)

        expect(result.userEmail).to.equal('No notes added')
      })
    })
  })
})
