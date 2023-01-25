'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const CheckLiveBillRunService = require('../../../app/services/supplementary-billing/check-live-bill-run.service.js')

describe('Check Live Bill Run service', () => {
  let billRunRegion

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when an sroc supplementary bill run exists for this region and financial year', () => {
    describe('with a status considered to be "live"', () => {
      beforeEach(async () => {
        const billRun = await BillingBatchHelper.add()
        billRunRegion = billRun.regionId
      })

      it('returns `true`', async () => {
        const result = await CheckLiveBillRunService.go(billRunRegion, 2023)

        expect(result).to.be.true()
      })
    })

    describe('with a status not considered to be "live"', () => {
      beforeEach(async () => {
        const billRun = await BillingBatchHelper.add({ status: 'sent' })
        billRunRegion = billRun.regionId
      })

      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(billRunRegion, 2023)

        expect(result).to.be.false()
      })
    })
  })

  describe('when an sroc supplementary bill run does not exist for this region and financial year', () => {
    beforeEach(async () => {
      const billRun = await BillingBatchHelper.add({ fromFinancialYearEnding: 2024, toFinancialYearEnding: 2024 })
      billRunRegion = billRun.regionId
    })

    it('returns `false`', async () => {
      const result = await CheckLiveBillRunService.go(billRunRegion, 2023)

      expect(result).to.be.false()
    })
  })
})
