'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const { determineCurrentFinancialYear } = require('../../../app/lib/general.lib.js')

// Thing under test
const CheckLiveBillRunService = require('../../../app/services/bill-runs/check-live-bill-run.service.js')

describe('Check Live Bill Run service', () => {
  const billingPeriod = determineCurrentFinancialYear()
  const regionId = '6ec2f8b5-70e2-4abf-8ba9-026971d9de52'
  const toFinancialYearEnding = billingPeriod.endDate.getFullYear()

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when an sroc supplementary bill run exists for this region and financial year', () => {
    const batchType = 'supplementary'

    describe('with a status considered to be "live" (queued)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ batchType, regionId, toFinancialYearEnding, status: 'queued' })
      })

      it('returns `true`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, toFinancialYearEnding, batchType)

        expect(result).to.be.true()
      })
    })

    describe('with a status not considered to be "live" (sent)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ batchType, regionId, toFinancialYearEnding, status: 'sent' })
      })

      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, toFinancialYearEnding, batchType)

        expect(result).to.be.false()
      })
    })
  })

  describe('when an sroc annual bill run exists for this region and financial year', () => {
    const batchType = 'annual'

    describe('with a status considered to be "live" (sent)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ batchType, regionId, toFinancialYearEnding, status: 'sent' })
      })

      it('returns `true`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, toFinancialYearEnding, batchType)

        expect(result).to.be.true()
      })
    })

    describe('with a status not considered to be "live" (empty)', () => {
      beforeEach(async () => {
        await BillRunHelper.add({ batchType, regionId, toFinancialYearEnding, status: 'empty' })
      })

      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, toFinancialYearEnding, batchType)

        expect(result).to.be.false()
      })
    })
  })

  describe('when an sroc bill run does not exist', () => {
    const batchType = 'annual'

    beforeEach(async () => {
      await BillRunHelper.add({ batchType, regionId, toFinancialYearEnding })
    })

    describe('for this region', () => {
      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go('4f142d8d-ca04-48bc-8d03-31dcd05c7070', toFinancialYearEnding, batchType)

        expect(result).to.be.false()
      })
    })

    describe('for this financialYear', () => {
      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, 2023, batchType)

        expect(result).to.be.false()
      })
    })

    describe('for this batch type', () => {
      it('returns `false`', async () => {
        const result = await CheckLiveBillRunService.go(regionId, toFinancialYearEnding, 'supplementary')

        expect(result).to.be.false()
      })
    })
  })
})
