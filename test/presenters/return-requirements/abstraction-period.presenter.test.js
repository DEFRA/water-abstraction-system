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
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        }
      }
    }
  })

  describe('when provided with a populated session', () => {
    describe('and no payload', () => {
      it('correctly presents the data', () => {
        const result = AbstractionPeriodPresenter.go(session)

        expect(result).to.equal({
          id: '61e07498-f309-4829-96a9-72084a54996d',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          abstractionPeriod: {
            fromDay: null,
            fromMonth: null,
            toDay: null,
            toMonth: null
          }
        })
      })
    })
  })

  describe('and with a payload', () => {
    const payload = {
      'fromAbstractionPeriod-day': '01',
      'fromAbstractionPeriod-month': '12',
      'toAbstractionPeriod-day': '02',
      'toAbstractionPeriod-month': '7'
    }

    it('correctly presents the data', () => {
      const result = AbstractionPeriodPresenter.go(session, payload)

      expect(result).to.equal({
        id: '61e07498-f309-4829-96a9-72084a54996d',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        abstractionPeriod: {
          fromDay: '01',
          fromMonth: '12',
          toDay: '02',
          toMonth: '7'
        }
      })
    })
  })
})
