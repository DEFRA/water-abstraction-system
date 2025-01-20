'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StartPresenter = require('../../../../app/presenters/return-logs/setup/start.presenter.js')

describe('Return Logs Setup - Start presenter', () => {
  let session

  describe('when provided with a populated session', () => {
    beforeEach(() => {
      session = _testSession()
    })

    it('correctly presents the data', () => {
      const result = StartPresenter.go(session)

      expect(result).to.equal({
        abstractionPeriod: 'From 1 January to 31 December',
        backLink: '/system/return-logs/setup/e840675e-9fb9-4ce1-bf0a-d140f5c57f47/received',
        beenReceived: false,
        journey: null,
        licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
        licenceRef: '01/111',
        pageTitle: 'Abstraction return',
        purposes: 'Evaporative Cooling',
        returnsPeriod: 'From 1 April 2022 to 31 March 2023',
        returnReference: '1234',
        siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
        status: 'overdue',
        tariffType: 'Standard tariff'
      })
    })

    describe('the "journey" property', () => {
      describe('when an option has been selected and submitted', () => {
        beforeEach(() => {
          session.journey = 'enter-return'
        })

        it('returns the selected option', () => {
          const result = StartPresenter.go(session)

          expect(result.journey).to.equal('enter-return')
        })
      })
    })

    describe('the "status" property', () => {
      describe('when the status is not yet "overdue"', () => {
        beforeEach(() => {
          session.dueDate = new Date()
        })

        it('returns the status as "due', () => {
          const result = StartPresenter.go(session)

          expect(result.status).to.equal('due')
        })
      })

      describe('when the status is "overdue"', () => {
        beforeEach(() => {
          // The due date is less than today's date
          session.dueDate = new Date('2023-04-28')
        })

        it('returns the status as "overdue', () => {
          const result = StartPresenter.go(session)

          expect(result.status).to.equal('overdue')
        })
      })
    })

    describe('the "tariffType" property', () => {
      describe('when the tariff type is two-part tariff', () => {
        beforeEach(() => {
          session.twoPartTariff = true
        })

        it('returns the correct tariff type', () => {
          const result = StartPresenter.go(session)

          expect(result.tariffType).to.equal('Two part tariff')
        })
      })
    })
  })
})

function _testSession() {
  return {
    id: 'e840675e-9fb9-4ce1-bf0a-d140f5c57f47',
    beenReceived: false,
    dueDate: '2023-04-28T00:00:00.000Z',
    endDate: '2023-03-31T00:00:00.000Z',
    licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
    licenceRef: '01/111',
    periodEndDay: 31,
    periodEndMonth: 12,
    periodStartDay: 1,
    periodStartMonth: 1,
    purposes: 'Evaporative Cooling',
    returnReference: '1234',
    siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
    startDate: '2022-04-01T00:00:00.000Z',
    status: 'due',
    twoPartTariff: false,
    underQuery: false
  }
}
