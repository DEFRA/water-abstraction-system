'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const AbstractionPeriodPresenter = require('../../../../app/presenters/return-versions/setup/abstraction-period.presenter.js')

describe('Return Versions Setup - Abstraction Period presenter', () => {
  const requirementIndex = 0

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
    it('correctly presents the data', () => {
      const result = AbstractionPeriodPresenter.go(session, requirementIndex)

      expect(result).to.equal({
        abstractionPeriod: null,
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/points/0',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'Enter the abstraction period for the requirements for returns',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d'
      })
    })
  })

  describe('the "abstractionPeriod" property', () => {
    describe('when the user has previously submitted an abstraction period', () => {
      beforeEach(() => {
        session.requirements[0].abstractionPeriod = {
          'start-abstraction-period-day': '07',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': '22',
          'end-abstraction-period-month': '07'
        }
      })

      it('returns a populated abstraction period', () => {
        const result = AbstractionPeriodPresenter.go(session, requirementIndex)

        expect(result.abstractionPeriod).to.equal({
          'start-abstraction-period-day': '07',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': '22',
          'end-abstraction-period-month': '07'
        })
      })
    })

    describe('when the user has not previously submitted an abstraction period', () => {
      it('returns an empty abstraction period', () => {
        const result = AbstractionPeriodPresenter.go(session, requirementIndex)

        expect(result.abstractionPeriod).to.be.null()
      })
    })
  })

  describe('the "backLink" property', () => {
    describe('when the user has come from the "check" page', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('returns a link back to the "check" page', () => {
        const result = AbstractionPeriodPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check')
      })
    })

    describe('when the user has come from somewhere else', () => {
      it('returns a link back to the "points" page', () => {
        const result = AbstractionPeriodPresenter.go(session, requirementIndex)

        expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/points/0')
      })
    })
  })
})
