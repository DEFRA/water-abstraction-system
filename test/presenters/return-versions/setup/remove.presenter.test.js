// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import RemovePresenter from '../../../../src/presenters/return-versions/setup/remove.presenter.js'

describe('Return Versions Setup - Remove presenter', () => {
  const requirementIndex = 0

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
      const result = RemovePresenter(session, requirementIndex)

      expect(result).toEqual({
        backLink: {
          href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
          text: 'Back'
        },
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'You are about to remove these requirements for returns',
        pageTitleCaption: 'Licence 01/ABC',
        returnRequirement: 'Winter and all year monthly requirements for returns, Bore hole in rear field.',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 January 2023'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "setup" page', () => {
      const result = RemovePresenter(session, requirementIndex)

      expect(result.backLink).toEqual({
        href: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        text: 'Back'
      })
    })
  })

  describe('the "returnRequirement" property', () => {
    describe('when the user has completed the return requirements journey', () => {
      beforeEach(() => {
        session.requirements[0] = {
          abstractionPeriod: {
            abstractionPeriodEndDay: '12',
            abstractionPeriodEndMonth: '09',
            abstractionPeriodStartDay: '12',
            abstractionPeriodStartMonth: '07'
          },
          agreementsExceptions: ['transfer-re-abstraction-scheme', 'two-part-tariff'],
          frequencyCollected: 'week',
          frequencyReported: 'month',
          points: ['At National Grid Reference TQ 71266 38507 (RIVER TEISE AT SMALLBRIDGE INTAKE)'],
          purposes: ['Potable Water Supply - Direct'],
          returnsCycle: 'summer',
          siteDescription: 'This is a valid return requirements description'
        }
      })

      it('returns the formatted requirement for returns', () => {
        const result = RemovePresenter(session, requirementIndex)

        expect(result.returnRequirement).toEqual(
          'Summer monthly requirements for returns, This is a valid return requirements description.'
        )
      })
    })
  })
})
