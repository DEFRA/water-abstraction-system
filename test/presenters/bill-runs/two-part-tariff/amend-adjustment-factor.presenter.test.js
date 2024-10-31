'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Thing under test
const AmendAdjustmentFactorPresenter = require('../../../../app/presenters/bill-runs/two-part-tariff/amend-adjustment-factor.presenter.js')

describe('Amend Adjustment Factor presenter', () => {
  const licenceId = '5aa8e752-1a5c-4b01-9112-d92a543b70d1'
  let reviewChargeReference
  let billRun

  describe('when there is data to be presented for the amend adjustment factor page', () => {
    beforeEach(() => {
      billRun = _billRun()
      reviewChargeReference = _reviewChargeReference()
    })

    it('correctly presents the data', () => {
      const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

      expect(result).to.equal({
        billRunId: '6620135b-0ecf-4fd4-924e-371f950c0526',
        licenceId: '5aa8e752-1a5c-4b01-9112-d92a543b70d1',
        financialYear: '2022 to 2023',
        chargePeriod: '1 September 2022 to 31 March 2023',
        chargeReference: {
          id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
          description: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr',
          aggregateFactor: 1,
          chargeAdjustment: 1,
          otherAdjustments: []
        }
      })
    })

    describe('the "otherAdjustments" property', () => {
      describe('when the charge reference has a abatement agreement', () => {
        beforeEach(() => {
          reviewChargeReference.abatementAgreement = 0.3
        })

        it('adds the abatement agreement to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Abatement agreement (0.3)'])
        })
      })

      describe('when the charge reference has a winter discount', () => {
        beforeEach(() => {
          reviewChargeReference.winterDiscount = true
        })

        it('adds the winter discount to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Winter discount'])
        })
      })

      describe('when the charge reference has a two part tariff agreement', () => {
        beforeEach(() => {
          reviewChargeReference.twoPartTariffAgreement = true
        })

        it('adds the two part tariff agreement to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Two part tariff agreement'])
        })
      })

      describe('when the charge reference has a canal and river trust agreement', () => {
        beforeEach(() => {
          reviewChargeReference.canalAndRiverTrustAgreement = true
        })

        it('adds the canal and river trust agreement to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Canal and River trust agreement'])
        })
      })

      describe('when the charge reference has a supported source', () => {
        beforeEach(() => {
          reviewChargeReference.chargeReference.supportedSourceName = 'Thames'
        })

        it('adds the supported source to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Supported source Thames'])
        })
      })

      describe('when the charge reference has a public water supply', () => {
        beforeEach(() => {
          reviewChargeReference.chargeReference.waterCompanyCharge = true
        })

        it('adds the public water supply to the otherAdjustments property', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal(['Public Water Supply'])
        })
      })

      describe('when the charge reference has no other adjustments', () => {
        it('sets the otherAdjustments property as empty', () => {
          const result = AmendAdjustmentFactorPresenter.go(billRun, reviewChargeReference, licenceId)

          expect(result.chargeReference.otherAdjustments).to.equal([])
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

function _reviewChargeReference () {
  return {
    id: 'e93fa3c6-195f-48eb-a03f-f87db7218f2d',
    reviewChargeVersionId: 'ad4d0543-e129-429b-ab36-39d0804637b7',
    chargeReferenceId: 'c61dfa06-e8e9-413e-93d8-0aedbf4d8638',
    aggregate: 1.25,
    createdAt: new Date('2024-05-02'),
    updatedAt: new Date('2024-05-02'),
    amendedAggregate: 1,
    chargeAdjustment: 1,
    amendedChargeAdjustment: 1,
    abatementAgreement: 1,
    winterDiscount: false,
    twoPartTariffAgreement: false,
    canalAndRiverTrustAgreement: false,
    authorisedVolume: 60,
    amendedAuthorisedVolume: 60,
    reviewChargeVersion: {
      chargePeriodStartDate: new Date('2022-09-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    },
    chargeReference: {
      volume: 60,
      chargeCategoryId: '65e80b7f-13fb-4d27-b739-20f0adf36b54',
      supportedSourceName: null,
      waterCompanyCharge: null,
      chargeCategory: {
        reference: '4.6.13',
        shortDescription: 'High loss, non-tidal, greater than 50 up to and including 85 ML/yr'
      }
    },
    reviewChargeElements: []
  }
}
