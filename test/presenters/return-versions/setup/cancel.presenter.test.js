'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CancelPresenter = require('../../../../app/presenters/return-versions/setup/cancel.presenter.js')

describe('Return Versions Setup - Cancel presenter', () => {
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
      requirements: [
        {
          points: ['At National Grid Reference TQ 6520 5937 (POINT A, ADDINGTON SANDPITS)'],
          purposes: ['Mineral Washing'],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Bore hole in rear field',
          abstractionPeriod: {
            'abstraction-period-end-day': '31',
            'abstraction-period-end-month': '10',
            'abstraction-period-start-day': '1',
            'abstraction-period-start-month': '4'
          },
          frequencyReported: 'month',
          frequencyCollected: 'month',
          agreementsExceptions: ['none']
        }
      ],
      startDateOptions: 'licenceStartDate',
      reason: 'major-change'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = CancelPresenter.go(session)

      expect(result).to.equal({
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'You are about to cancel these requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        reason: 'Major change',
        returnRequirements: ['Winter and all year monthly requirements for returns, Bore hole in rear field.'],
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 January 2023'
      })
    })
  })

  describe('the "reason" property', () => {
    it('returns the display version for the reason', () => {
      const result = CancelPresenter.go(session)

      expect(result.reason).to.equal('Major change')
    })
  })

  describe('the "returnRequirements" property', () => {
    describe('when the user journey was "no-returns-required"', () => {
      beforeEach(() => {
        session.journey = 'no-returns-required'
      })

      it('returns null', () => {
        const result = CancelPresenter.go(session)

        expect(result.returnRequirements).to.be.null()
      })
    })

    describe('when the user journey was "returns-required"', () => {
      it('returns a summary for each requirement in the session', () => {
        const result = CancelPresenter.go(session)

        expect(result.returnRequirements).to.equal([
          'Winter and all year monthly requirements for returns, Bore hole in rear field.'
        ])
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when the user has previously selected the licence start date as the start date', () => {
      it('returns the licence version start date formatted as a long date', () => {
        const result = CancelPresenter.go(session)

        expect(result.startDate).to.equal('1 January 2023')
      })
    })

    describe('when the user has previously selected another date as the start date', () => {
      beforeEach(() => {
        session.startDateDay = '26'
        session.startDateMonth = '11'
        session.startDateYear = '2023'
        session.startDateOptions = 'anotherStartDate'
      })

      it('returns the start date parts formatted as a long date', () => {
        const result = CancelPresenter.go(session)

        expect(result.startDate).to.equal('26 November 2023')
      })
    })
  })
})
