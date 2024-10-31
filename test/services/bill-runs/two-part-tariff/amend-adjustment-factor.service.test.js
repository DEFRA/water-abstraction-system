'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const FetchReviewChargeReferenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-review-charge-reference.service.js')

// Thing under test
const AmendAdjustmentFactorService = require('../../../../app/services/bill-runs/two-part-tariff/amend-adjustment-factor.service.js')

describe('Amend Adjustment Factor Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a billRun, licence and a reviewChargeReferenceId', () => {
    const reviewChargeReferenceId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
    const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

    beforeEach(() => {
      Sinon.stub(FetchReviewChargeReferenceService, 'go').resolves({
        billRun: _billRun(),
        reviewChargeReference: _reviewChargeReferenceData()
      })
    })

    it('will fetch the charge reference data and return it once formatted by the presenter', async () => {
      const result = await AmendAdjustmentFactorService.go(billRunId, licenceId, reviewChargeReferenceId)

      // NOTE: The service mainly just regurgitates what the AmendAdjustmentFactorPresenter returns. So, we don't
      // diligently check each property of the result because we know this will have been covered by the
      // AmendAdjustmentFactorPresenter
      expect(FetchReviewChargeReferenceService.go.called).to.be.true()
      expect(result.billRunId).to.equal('cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
      expect(result.licenceId).to.equal('9a8a148d-b71e-463c-bea8-bc5e0a5d95e2')
      expect(result.financialYear).to.equal('2022 to 2023')
      expect(result.chargeReference.description).to.equal(
        'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model'
      )
    })
  })
})

function _billRun () {
  return {
    id: 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e',
    toFinancialYearEnding: 2023
  }
}

function _reviewChargeReferenceData () {
  return {
    id: '89eebffa-28a2-489d-b93a-c0f02a2bdbdd',
    reviewChargeVersionId: '4940eaca-8cf1-410b-8a89-faf1faa8081b',
    chargeReferenceId: '4e7f1824-3680-4df0-806f-c6d651ba4771',
    aggregate: 1,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
    amendedAggregate: 1,
    chargeAdjustment: 1,
    amendedChargeAdjustment: 1,
    abatementAgreement: 1,
    winterDiscount: false,
    twoPartTariffAgreement: true,
    canalAndRiverTrustAgreement: false,
    authorisedVolume: 32,
    amendedAuthorisedVolume: 32,
    reviewChargeVersion: {
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2023-03-31')
    },
    chargeReference: {
      volume: 32,
      chargeCategoryId: 'c037ad9a-d3b4-4b1b-8ac9-1cd2b46d152f',
      supportedSourceName: null,
      waterCompanyCharge: null,
      chargeCategory: {
        reference: '4.6.12',
        shortDescription: 'High loss, non-tidal, restricted water, greater than 15 up to and including 50 ML/yr, Tier 2 model'
      }
    },
    reviewChargeElements: [{ amendedAllocated: 0.00018 }]
  }
}
