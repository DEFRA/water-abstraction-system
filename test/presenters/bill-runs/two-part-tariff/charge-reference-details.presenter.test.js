'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const ChargeReferenceDetailsPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/charge-reference-details.presenter.js')

describe('Charge Reference Details presenter', () => {
  describe('when there is data to be presented for the charge reference details page', () => {
    const billRun = _billRun()
    const licenceId = '5aa8e752-1a5c-4b01-9112-d92a543b70d1'

    let reviewChargeReference

    beforeEach(() => {
      reviewChargeReference = _reviewChargeReferenceData()
    })

    it('correctly presents the data', async () => {
      const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        financialYear: '2022 to 2023',
        chargePeriod: '1 April 2022 to 31 March 2023',
        licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
        chargeReference: {
          id: '89eebffa-28a2-489d-b93a-c0f02a2bdbdd',
          reference: '4.6.12',
          description: 'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model',
          totalBillableReturns: 0.00018,
          authorisedVolume: 32,
          adjustments: [],
          additionalCharges: ''
        },
        hasAggregateOrChargeFactor: false
      })
    })

    describe('the "adjustments" property', () => {
      describe('when the charge reference has an aggregate factor', () => {
        beforeEach(() => {
          reviewChargeReference.amendedAggregate = 0.5
          reviewChargeReference.aggregate = 0.5
        })

        it('adds the aggregate factor to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Aggregate factor (0.5)'])
        })

        it('sets the "hasAggregateOrChargeFactor" property to true', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.hasAggregateOrChargeFactor).to.equal(true)
        })

        describe('when the source aggregate factor is different to the amendedAggregate factor', () => {
          beforeEach(() => {
            reviewChargeReference.aggregate = 0.5
            reviewChargeReference.amendedAggregate = 1
          })

          it('sets the "hasAggregateOrChargeFactor" property to true', () => {
            const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

            expect(result.hasAggregateOrChargeFactor).to.equal(true)
          })
        })
      })

      describe('when the charge reference has a charge adjustment factor', () => {
        beforeEach(() => {
          reviewChargeReference.amendedChargeAdjustment = 0.7
          reviewChargeReference.chargeAdjustment = 0.7
        })

        it('adds the charge adjustment factor to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Charge adjustment (0.7)'])
        })

        it('sets the "hasAggregateOrChargeFactor" property to true', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.hasAggregateOrChargeFactor).to.equal(true)
        })

        describe('when the source charge adjustment factor is different to the amendedChargeAdjustment factor', () => {
          beforeEach(() => {
            reviewChargeReference.chargeAdjustment = 0.5
            reviewChargeReference.amendedChargeAdjustment = 1
          })

          it('sets the "hasAggregateOrChargeFactor" property to true', () => {
            const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

            expect(result.hasAggregateOrChargeFactor).to.equal(true)
          })
        })
      })

      describe('when the charge reference has a abatement agreement', () => {
        beforeEach(() => {
          reviewChargeReference.abatementAgreement = 0.3
        })

        it('adds the abatement agreement to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Abatement agreement (0.3)'])
        })
      })

      describe('when the charge reference has a winter discount', () => {
        beforeEach(() => {
          reviewChargeReference.winterDiscount = true
        })

        it('adds the winter discount to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Winter discount'])
        })
      })

      describe('when the charge reference has a two part tariff agreement', () => {
        beforeEach(() => {
          reviewChargeReference.twoPartTariffAgreement = true
        })

        it('adds the two part tariff agreement to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Two part tariff agreement'])
        })
      })

      describe('when the charge reference has a canal and river trust agreement', () => {
        beforeEach(() => {
          reviewChargeReference.canalAndRiverTrustAgreement = true
        })

        it('adds the canal and river trust agreement to the adjustments property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal(['Canal and River trust agreement'])
        })
      })

      describe('when the charge reference has no adjustments', () => {
        it('sets the adjustments property as empty', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.adjustments).to.equal([])
        })

        it('sets "hasAggregateOrChargeFactor" property to false', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.hasAggregateOrChargeFactor).to.equal(false)
        })
      })
    })

    describe('the "additionalCharges" property', () => {
      describe('when the charge reference has a support source charge', () => {
        beforeEach(() => {
          reviewChargeReference.chargeReference.supportedSourceName = 'Thames'
        })

        it('adds the supported source charge to the "additionalCharges" property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.additionalCharges).to.equal('Supported source Thames')
        })
      })

      describe('when the charge reference has a water company charge', () => {
        beforeEach(() => {
          reviewChargeReference.chargeReference.waterCompanyCharge = true
        })

        it('adds the water company charge to the "additionalCharges" property', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.additionalCharges).to.equal('Public Water Supply')
        })

        describe('and a support source charge', () => {
          beforeEach(() => {
            reviewChargeReference.chargeReference.supportedSourceName = 'Thames'
          })

          it('adds the both charges to the "additionalCharges" property', () => {
            const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

            expect(result.chargeReference.additionalCharges).to.equal('Supported source Thames, Public Water Supply')
          })
        })
      })

      describe('when the charge reference has no extra charges', () => {
        it('sets the "additionalCharges" property to empty', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.additionalCharges).to.equal('')
        })
      })
    })

    describe('the "totalBillableReturns" property', () => {
      describe('when there are multiple charge elements on the charge reference', () => {
        beforeEach(() => {
          reviewChargeReference.reviewChargeElements = [{ amendedAllocated: 1 }, { amendedAllocated: 2 }]
        })

        it('adds the "amendedAllocated" property on the charge elements', () => {
          const result = ChargeReferenceDetailsPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.totalBillableReturns).to.equal(3)
        })
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

function _reviewChargeReferenceData () {
  return {
    id: '89eebffa-28a2-489d-b93a-c0f02a2bdbdd',
    reviewChargeVersionId: '4940eaca-8cf1-410b-8a89-faf1faa8081b',
    chargeReferenceId: '4e7f1824-3680-4df0-806f-c6d651ba4771',
    aggregate: 1,
    createdAt: new Date('2022-03-31'),
    updatedAt: new Date('2024-05-01'),
    amendedAggregate: 1,
    chargeAdjustment: 1,
    amendedChargeAdjustment: 1,
    abatementAgreement: 1,
    winterDiscount: false,
    twoPartTariffAgreement: false,
    canalAndRiverTrustAgreement: false,
    authorisedVolume: 32,
    amendedAuthorisedVolume: 32,
    reviewChargeVersion: {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    },
    reviewChargeElements: [{ amendedAllocated: 0.00018 }],
    chargeReference: {
      volume: 32,
      chargeCategoryId: 'c037ad9a-d3b4-4b1b-8ac9-1cd2b46d152f',
      supportedSourceName: null,
      waterCompanyCharge: null,
      chargeCategory: {
        reference: '4.6.12',
        shortDescription: 'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model'
      }
    }
  }
}
