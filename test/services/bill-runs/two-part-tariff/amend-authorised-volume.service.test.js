'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Things we need to stub
const FetchAuthorisedVolumeService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-authorised-volume.service.js')

// Thing under test
const AmendAuthorisedVolumeService = require('../../../../app/services/bill-runs/two-part-tariff/amend-authorised-volume.service.js')

describe('Amend Authorised Volume Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when given a billRun, licence, and a reviewChargeReferenceId', () => {
    const reviewChargeReferenceId = '2c80bd22-a005-4cf4-a2a2-73812a9861de'
    const billRunId = 'cc4bbb18-0d6a-4254-ac2c-7409de814d7e'
    const licenceId = '9a8a148d-b71e-463c-bea8-bc5e0a5d95e2'

    beforeEach(() => {
      Sinon.stub(FetchAuthorisedVolumeService, 'go').resolves({
        billRun: _billRun(),
        reviewChargeReference: _reviewChargeReferenceData()
      })
    })

    it('will fetch the charge reference data and return it once formatted by the presenter', async () => {
      const result = await AmendAuthorisedVolumeService.go(billRunId, licenceId, reviewChargeReferenceId)

      // NOTE: The service mainly just regurgitates what the AmendAuthorisedVolumePresenter returns. So, we don't
      // diligently check each property of the result because we know this will have been covered by the
      // AmendAuthorisedVolumePresenter tests
      expect(FetchAuthorisedVolumeService.go.called).to.be.true()
      expect(result.billRunId).to.equal('cc4bbb18-0d6a-4254-ac2c-7409de814d7e')
      expect(result.licenceId).to.equal('9a8a148d-b71e-463c-bea8-bc5e0a5d95e2')
      expect(result.financialYear).to.equal('2022 to 2023')
      expect(result.chargeReference.description).to.equal(
        'Medium loss, non-tidal, greater than 83 up to and including 142 ML/yr'
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
      chargePeriodStartDate: new Date('2022-04-01'),
      chargePeriodEndDate: new Date('2022-06-01')
    }
  }
}
