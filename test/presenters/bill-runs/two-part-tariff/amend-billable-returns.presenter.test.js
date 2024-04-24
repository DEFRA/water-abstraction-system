'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const AmendBillableReturnsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-billable-returns.presenter.js')

describe('Amend Billable Returns presenter', () => {
  describe('when there is data to be presented for the amend billable returns page', () => {
    const billRun = _billRun()
    const reviewChargeElement = _reviewChargeElementData()
    const licenceId = '5aa8e752-1a5c-4b01-9112-d92a543b70d1'

    it('correctly presents the data', async () => {
      const result = AmendBillableReturnsPresenter.go(billRun, reviewChargeElement, licenceId)

      expect(result).to.equal({
        chargeElement: {
          description: 'Trickle Irrigation - Direct',
          dates: ['1 April 2022 to 5 June 2022'],
          authorisedQuantity: 200,
          reviewChargeElementId: 'b4d70c89-de1b-4f68-a47f-832b338ac044'
        },
        billRun: {
          id: '6620135b-0ecf-4fd4-924e-371f950c0526',
          financialYear: '2022 to 2023'
        },
        chargeVersion: {
          chargePeriod: '1 April 2022 to 5 June 2022'
        },
        licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1'
      })
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    fromFinancialYearEnding: 2023,
    toFinancialYearEnding: 2023
  }
}

function _reviewChargeElementData () {
  return {
    id: 'b4d70c89-de1b-4f68-a47f-832b338ac044',
    reviewChargeReferenceId: '9e5d87d7-073e-420e-b12d-73ca220dd8ef',
    chargeElementId: 'b345f1f1-496b-4049-a647-6bcd123dcf68',
    allocated: 0,
    status: 'ready',
    createdAt: new Date('2024-04-02'),
    updatedAt: new Date('2024-04-02'),
    chargeElement: {
      description: 'Trickle Irrigation - Direct',
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      authorisedAnnualQuantity: 200
    },
    reviewChargeReference: {
      id: '9e5d87d7-073e-420e-b12d-73ca220dd8ef',
      reviewChargeVersion: {
        chargePeriodStartDate: new Date('2022-04-01'),
        chargePeriodEndDate: new Date('2022-06-05')
      }
    }
  }
}
