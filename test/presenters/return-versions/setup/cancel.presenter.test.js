// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import CancelPresenter from '../../../../src/presenters/return-versions/setup/cancel.presenter.js'

describe('Return Versions Setup - Cancel presenter', () => {
  let session

  beforeEach(() => {
    session = {
      checkPageVisited: false,
      id: '61e07498-f309-4829-96a9-72084a54996d',
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        startDate: '2022-04-01T00:00:00.000Z'
      },
      reason: 'major-change',
      requirements: [
        {
          abstractionPeriod: {
            abstractionPeriodEndDay: '31',
            abstractionPeriodEndMonth: '10',
            abstractionPeriodStartDay: '1',
            abstractionPeriodStartMonth: '4'
          },
          agreementsExceptions: ['none'],
          frequencyCollected: 'month',
          frequencyReported: 'month',
          points: ['At National Grid Reference TQ 6520 5937 (POINT A, ADDINGTON SANDPITS)'],
          purposes: ['Mineral Washing'],
          returnsCycle: 'winter-and-all-year',
          siteDescription: 'Bore hole in rear field'
        }
      ],
      startDateOptions: 'licenceStartDate'
    }
  })

  describe('when provided with a session', () => {
    it('correctly presents the data', () => {
      const result = CancelPresenter(session)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        },
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
      const result = CancelPresenter(session)

      expect(result.reason).toEqual('Major change')
    })
  })

  describe('the "returnRequirements" property', () => {
    describe('when the user journey was "no-returns-required"', () => {
      beforeEach(() => {
        session.journey = 'no-returns-required'
      })

      it('returns null', () => {
        const result = CancelPresenter(session)

        expect(result.returnRequirements).toBeNull()
      })
    })

    describe('when the user journey was "returns-required"', () => {
      it('returns a summary for each requirement in the session', () => {
        const result = CancelPresenter(session)

        expect(result.returnRequirements).toEqual([
          'Winter and all year monthly requirements for returns, Bore hole in rear field.'
        ])
      })
    })
  })

  describe('the "startDate" property', () => {
    describe('when the user has previously selected the licence start date as the start date', () => {
      it('returns the licence version start date formatted as a long date', () => {
        const result = CancelPresenter(session)

        expect(result.startDate).toEqual('1 January 2023')
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
        const result = CancelPresenter(session)

        expect(result.startDate).toEqual('26 November 2023')
      })
    })
  })
})
