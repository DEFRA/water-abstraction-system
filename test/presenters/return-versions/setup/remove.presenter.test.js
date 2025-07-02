'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const RemovePresenter = require('../../../../app/presenters/return-versions/setup/remove.presenter.js')

describe('Return Versions Setup - Remove presenter', () => {
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
      const result = RemovePresenter.go(session, requirementIndex)

      expect(result).to.equal({
        backLink: '/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        pageTitle: 'You are about to remove these requirements for returns',
        returnRequirement: 'Winter and all year monthly requirements for returns, Bore hole in rear field.',
        sessionId: '61e07498-f309-4829-96a9-72084a54996d',
        startDate: '1 January 2023'
      })
    })
  })

  describe('the "backLink" property', () => {
    it('returns a link back to the "setup" page', () => {
      const result = RemovePresenter.go(session, requirementIndex)

      expect(result.backLink).to.equal('/system/return-versions/setup/61e07498-f309-4829-96a9-72084a54996d/check')
    })
  })

  describe('the "returnRequirement" property', () => {
    describe('when the user has completed the return requirements journey', () => {
      beforeEach(() => {
        session.requirements[0] = {
          points: ['At National Grid Reference TQ 71266 38507 (RIVER TEISE AT SMALLBRIDGE INTAKE)'],
          purposes: ['Potable Water Supply - Direct'],
          returnsCycle: 'summer',
          siteDescription: 'This is a valid return requirements description',
          abstractionPeriod: {
            'abstraction-period-end-day': '12',
            'abstraction-period-end-month': '09',
            'abstraction-period-start-day': '12',
            'abstraction-period-start-month': '07'
          },
          frequencyReported: 'month',
          frequencyCollected: 'week',
          agreementsExceptions: ['transfer-re-abstraction-scheme', 'two-part-tariff']
        }
      })

      it('returns the formatted requirement for returns', () => {
        const result = RemovePresenter.go(session, requirementIndex)

        expect(result.returnRequirement).to.equal(
          'Summer monthly requirements for returns, This is a valid return requirements description.'
        )
      })
    })
  })
})
