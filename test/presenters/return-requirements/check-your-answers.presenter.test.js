'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CheckYourAnswersPresenter = require('../../../app/presenters/return-requirements/check-your-answers.presenter.js')

describe('Check Your Answers presenter - No Returns Required', () => {
  let session

  beforeEach(() => {
    session = {
      data: {
        licence: {
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Astro Boy'
        },
        journey: 'no-returns-required',
        noReturnsRequired: 'returns-exception',
        startDate: '2008-02-08',
        startDateDay: '08',
        startDateMonth: '02',
        startDateOptions: 'anotherStartDate',
        startDateYear: '2008'
      }
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = CheckYourAnswersPresenter.go(session)

      expect(result).to.equal({
        journey: 'no-returns-required',
        licenceRef: '01/123',
        reason: 'returns-exception',
        startDate: '8 February 2008'
      }, { skip: ['id'] })
    })
  })
})

describe('Check Your Answers presenter - Returns Required', () => {
  let session

  beforeEach(() => {
    session = {
      data: {
        licence: {
          currentVersionStartDate: '2008-02-08T00:00:00.000Z',
          id: 'ea53bfc6-740d-46c5-9558-fc8cabfc6c1f',
          licenceRef: '01/123',
          licenceHolder: 'Astro Boy'
        },
        returnsRequired: 'major-change',
        journey: 'returns-required',
        startDateOptions: 'licenceStartDate'
      }
    }
  })

  describe('when provided with a populated session', () => {
    it('correctly presents the data', () => {
      const result = CheckYourAnswersPresenter.go(session)

      expect(result).to.equal({
        journey: 'returns-required',
        licenceRef: '01/123',
        reason: 'major-change',
        startDate: '8 February 2008'
      }, { skip: ['id'] })
    })
  })
})
