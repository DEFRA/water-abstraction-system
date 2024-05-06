'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AbstractionPeriodPresenter = require('../../../app/presenters/return-requirements/abstraction-period.presenter.js')

describe('Abstraction Period presenter', () => {
  let session

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
      }
    }
  })

  describe('when provided with a session where abstraction period is populated', () => {
    beforeEach(() => {
      session.abstractionPeriod = {
        'start-abstraction-period-day': '07',
        'start-abstraction-period-month': '12',
        'end-abstraction-period-day': '22',
        'end-abstraction-period-month': '07'
      }
    })

    it('correctly presents the data', () => {
      const result = AbstractionPeriodPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: {
          'start-abstraction-period-day': '07',
          'start-abstraction-period-month': '12',
          'end-abstraction-period-day': '22',
          'end-abstraction-period-month': '07'
        },
        id: '61e07498-f309-4829-96a9-72084a54996d',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC'
      })
    })
  })

  describe('when provided with a session where abstraction period is not populated', () => {
    it('correctly presents the data', () => {
      const result = AbstractionPeriodPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: null,
        id: '61e07498-f309-4829-96a9-72084a54996d',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC'
      })
    })
  })
})
