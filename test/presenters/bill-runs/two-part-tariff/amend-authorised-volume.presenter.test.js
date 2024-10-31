'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const AmendAuthorisedVolumePresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-authorised-volume.presenter.js')

describe('Amend Authorised Volume presenter', () => {
  const licenceId = '5aa8e752-1a5c-4b01-9112-d92a543b70d1'
  let reviewChargeReference
  let billRun

  describe('when there is data to be presented for the amend authorised volume page', () => {
    beforeEach(() => {
      billRun = _billRun()
      reviewChargeReference = _reviewChargeReference()
    })

    it('correctly presents the data', () => {
      const result = AmendAuthorisedVolumePresenter.go(billRun, reviewChargeReference, licenceId)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
        financialYear: '2022 to 2023',
        chargePeriod: '1 September 2022 to 31 March 2023',
        chargeReference: {
          id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
          description: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
          authorisedVolume: 25.5,
          totalBillableReturns: 15
        },
        chargeCategory: {
          minVolume: 83,
          maxVolume: 142
        }
      })
    })

    describe('the "totalBillableReturns" property', () => {
      describe('when there are multiple reviewChargeElements', () => {
        beforeEach(() => {
          reviewChargeReference.reviewChargeElements.push({
            amendedAllocated: 17
          })
        })

        it('sums the amendedAllocated volumes up', () => {
          const result = AmendAuthorisedVolumePresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.totalBillableReturns).to.equal(32)
        })
      })

      describe('when there are no reviewChargeElements', () => {
        beforeEach(() => {
          reviewChargeReference.reviewChargeElements = []
        })

        it('returns a total of 0', () => {
          const result = AmendAuthorisedVolumePresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.totalBillableReturns).to.equal(0)
        })
      })
    })
  })
})

function _billRun () {
  return {
    id: '6620135b-0ecf-4fd4-924e-371f950c0526',
    toFinancialYearEnding: 2023
  }
}

function _reviewChargeReference () {
  return {
    id: '6b3d11f2-d361-4eaa-bce2-5561283bd023',
    amendedAuthorisedVolume: 25.5,
    chargeReference: {
      chargeCategoryId: 'b4354db6-6699-4987-b4c8-d53ac2bf2250',
      chargeCategory: {
        shortDescription: 'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr',
        minVolume: 83,
        maxVolume: 142
      }
    },
    reviewChargeElements: [{
      amendedAllocated: 15
    }],
    reviewChargeVersion: {
      chargePeriodStartDate: new Date('2022-09-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    }
  }
}
