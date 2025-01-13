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
        displayRecordReceipt: true,
        licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
        licenceRef: '01/111',
        pageTitle: 'Abstraction return',
        purposes: 'Evaporative Cooling',
        returnLogId: 'v1:6:01/111:2222:2022-04-01:2005-03-31',
        returnsPeriod: 'From 1 April 2022 to 31 March 2023',
        returnReference: '1234',
        selectedOption: undefined,
        siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
        status: 'overdue',
        tariffType: 'Standard tariff'
      })
    })

    describe('the "displayRecordReceipt" property', () => {
      describe('when the return log has a received date', () => {
        beforeEach(() => {
          session.receivedDate = '2023-04-27T00:00:00.000Z'
        })

        it('sets the property to false', () => {
          const result = StartPresenter.go(session)

          expect(result.displayRecordReceipt).to.be.false()
        })
      })
    })

    describe('the "selectedOption" property', () => {
      describe('when an option has been selected and submitted', () => {
        beforeEach(() => {
          session.whatToDo = 'enterReturn'
        })

        it('returns the selected option', () => {
          const result = StartPresenter.go(session)

          expect(result.selectedOption).to.equal('enterReturn')
        })
      })
    })

    describe('the "status" property', () => {
      describe('when the status is "completed"', () => {
        beforeEach(() => {
          session.status = 'completed'
        })

        it('returns the status as "complete', () => {
          const result = StartPresenter.go(session)

          expect(result.status).to.equal('complete')
        })
      })

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
    status: 'due',
    dueDate: '2023-04-28T00:00:00.000Z',
    endDate: '2023-03-31T00:00:00.000Z',
    purposes: 'Evaporative Cooling',
    licenceId: 'db3731ae-3dde-4778-a81e-9be549cfc0e1',
    startDate: '2022-04-01T00:00:00.000Z',
    licenceRef: '01/111',
    underQuery: false,
    returnLogId: 'v1:6:01/111:2222:2022-04-01:2005-03-31',
    periodEndDay: 31,
    receivedDate: null,
    twoPartTariff: false,
    periodEndMonth: 12,
    periodStartDay: 1,
    returnReference: '1234',
    siteDescription: 'POINT A, TIDAL RIVER MEDWAY AT ISLE OF GRAIN',
    periodStartMonth: 1
  }
}
