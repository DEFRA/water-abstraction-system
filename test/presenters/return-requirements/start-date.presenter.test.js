'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const StartDatePresenter = require('../../../app/presenters/return-requirements/start-date.presenter.js')

describe('Start Date presenter', () => {
  describe('when provided with an unpopulated session', () => {
    let session

    beforeEach(async () => {
      session = {
        id: 'd3fr4-f3ad-4cb6-a058-78abc4w4t3r',
        data: {
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2023-11-126T00:00:00.000Z'
          },
          selectedOption: null
        }
      }
    })

    it('correctly presents the data', () => {
      const result = StartDatePresenter.go(session)

      expect(result).to.equal({
        id: session.id,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        licenceVersionStartDate: '1 January 2023',
        anotherStartDateDay: null,
        anotherStartDateMonth: null,
        anotherStartDateYear: null,
        selectedOption: null
      }, { skip: ['id'] })
    })
  })

  describe('when provided with a populated session', () => {
    let session

    beforeEach(async () => {
      session = {
        id: 'd3fr4-f3ad-4cb6-a058-78abc4w4t3r',
        data: {
          licence: {
            id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            currentVersionStartDate: '2023-01-01T00:00:00.000Z',
            endDate: null,
            licenceRef: '01/ABC',
            licenceHolder: 'Turbo Kid',
            startDate: '2023-11-126T00:00:00.000Z'
          },
          startDateDay: '26',
          startDateMonth: '11',
          startDateYear: '2023',
          startDateOptions: 'anotherStartDate'
        }
      }
    })

    it('correctly presents the data', () => {
      const result = StartDatePresenter.go(session)

      expect(result).to.equal({
        id: session.id,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        licenceVersionStartDate: '1 January 2023',
        anotherStartDateDay: '26',
        anotherStartDateMonth: '11',
        anotherStartDateYear: '2023',
        selectedOption: 'anotherStartDate'
      }, { skip: ['id'] })
    })
  })
})
