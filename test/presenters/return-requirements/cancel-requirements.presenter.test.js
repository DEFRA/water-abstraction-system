'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CancelRequirementsPresenter = require('../../../app/presenters/return-requirements/cancel-requirements.presenter.js')

describe('Cancel Requirements presenter', () => {
  let session

  describe('when called from the returns requirement journey', () => {
    describe('and provided with completed session data for returns required', () => {
      beforeEach(() => {
        session = {
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          },
          data: {
            reason: 'abstraction-below-100-cubic-metres-per-day',
            startDateOptions: 'licenceStartDate',
            returnsCycle: 'winter-and-all-year',
            frequencyReported: 'monthly',
            siteDescription: 'This is a valid site description'
          }
        }
      })

      it('correctly presents the data', () => {
        const result = CancelRequirementsPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          reason: 'abstraction-below-100-cubic-metres-per-day',
          startDate: '1 January 2023',
          returnRequirements: 'Winter and all year monthly requirements for returns, This is a valid site description.'
        })
      })
    })
  })

  describe('when called from the no returns required journey', () => {
    describe('and provided with completed session data for no returns required', () => {
      beforeEach(() => {
        session = {
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2022-04-01T00:00:00.000Z'
          },
          data: {
            reason: 'abstraction-below-100-cubic-metres-per-day',
            startDateOptions: 'licenceStartDate'
          }
        }
      })

      it('correctly presents the data', () => {
        const result = CancelRequirementsPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          reason: 'abstraction-below-100-cubic-metres-per-day',
          startDate: '1 January 2023',
          returnRequirements: null
        })
      })
    })
  })
})
