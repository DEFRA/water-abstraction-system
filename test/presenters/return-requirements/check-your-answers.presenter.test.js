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
      data: {
        id: 'f1288f6c-8503-4dc1-b114-75c408a14bd0',
        licence: {
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Astro Boy'
        },
        journey: '',
        reason: '',
        startDate: '2008-02-08',
        startDateDay: '08',
        startDateMonth: '02',
        startDateOptions: 'anotherStartDate',
        startDateYear: '2008'
      }
    }
  })

  describe('when the no-returns-required journey was selected', () => {
    it('correctly presents the data with notes', () => {
      session.data.journey = 'no-returns-required'
      session.data.note = {
        content: 'Note attached to requirement',
        userEmail: 'carol.shaw@atari.com'
      }
      session.data.reason = 'returns-exception'

      const result = CheckYourAnswersPresenter.go(session)

      expect(result).to.equal({
        journey: 'no-returns-required',
        licenceRef: '01/123',
        note: 'Note attached to requirement',
        reason: 'returns-exception',
        startDate: '8 February 2008',
        userEmail: 'carol.shaw@atari.com'
      }, { skip: ['id'] })
    })
  })

  describe('when the returns-required journey was selected', () => {
    it('correctly presents the data without notes', () => {
      session.data.journey = 'returns-required'
      session.data.reason = 'major-change'

      const result = CheckYourAnswersPresenter.go(session)

      expect(result).to.equal({
        journey: 'returns-required',
        licenceRef: '01/123',
        note: '',
        reason: 'major-change',
        startDate: '8 February 2008',
        userEmail: ''
      }, { skip: ['id'] })
    })
  })
})
