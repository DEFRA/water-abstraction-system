'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../../support/helpers/water/billing-batch.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Thing under test
const CheckLiveBillRunService = require('../../../../app/services/billing/supplementary/check-live-bill-run.service.js')

describe('Check Live Bill Run service', () => {
  let billRun

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when an sroc supplementary bill run exists for this region and financial year', () => {
    describe('with a status considered to be "live"', () => {
      beforeEach(async () => {
        billRun = await BillingBatchHelper.add()
      })

      it('returns `true`', async () => {
        const result = await CheckLiveBillRunService.go(billRun.regionId, 2023)

        expect(result).to.be.true()
      })
    })

    describe('with a status not considered to be "live"', () => {
      beforeEach(async () => {
        billRun = await BillingBatchHelper.add({ status: 'sent' })
      })

      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(billRun.regionId, 2023)

        expect(result).to.be.false()
      })
    })
  })

  describe('when an sroc supplementary bill run does not exist for this region and financial year', () => {
    beforeEach(async () => {
      billRun = await BillingBatchHelper.add({ fromFinancialYearEnding: 2024, toFinancialYearEnding: 2024 })
    })

    it('returns `false`', async () => {
      const result = await CheckLiveBillRunService.go(billRun.regionId, 2023)

      expect(result).to.be.false()
    })
  })
})
