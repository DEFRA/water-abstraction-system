'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const BillingPeriodService = require('../../../app/services/supplementary-billing/billing-period.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const FetchRegionService = require('../../../app/services/supplementary-billing/fetch-region.service.js')

// Thing under test
const SupplementaryDataService = require('../../../app/services/check/supplementary-data.service.js')

describe('Supplementary service', () => {
  const naldRegionId = 9
  const currentBillingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  beforeEach(async () => {
    Sinon.stub(BillingPeriodService, 'go').returns([currentBillingPeriod])
    Sinon.stub(FetchRegionService, 'go').resolves({ regionId: 'bd114474-790f-4470-8ba4-7b0cc9c225d7' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('the response for billing periods', () => {
    beforeEach(async () => {
      Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
    })

    it('always includes the current billing period', async () => {
      const result = await SupplementaryDataService.go(naldRegionId)

      expect(result.billingPeriods).to.have.length(1)
      expect(result.billingPeriods[0]).to.equal(currentBillingPeriod)
    })
  })

  describe('the response for charge versions', () => {
    describe('when there are charge versions for supplementary billing', () => {
      const testRecords = [{
        chargeVersionId: '4b5cbe04-a0e2-468c-909e-1e2d93810ba8',
        scheme: 'sroc',
        endDate: null,
        licenceId: '2627a306-23a3-432f-9c71-a71663888285',
        licenceRef: 'AT/SROC/SUPB/01'
      }]

      beforeEach(async () => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves(testRecords)
      })

      it('returns the matching charge versions', async () => {
        const result = await SupplementaryDataService.go(naldRegionId)

        expect(result.chargeVersions).to.have.length(1)
        expect(result.chargeVersions[0].chargeVersionId).to.equal(testRecords[0].chargeVersionId)
      })
    })

    describe('When there are no charge versions for supplementary billing', () => {
      beforeEach(async () => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
      })

      it('returns no results', async () => {
        const result = await SupplementaryDataService.go(naldRegionId)

        expect(result.chargeVersions).to.be.empty()
      })
    })
  })
})
