'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseConfig = require('../../../config/database.config.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')

describe('Fetch Bill Runs service', () => {
  let page
  let region

  beforeEach(async () => {
    region = RegionHelper.select()

    // Set the default page size to 3 so we don't have to create loads of bill runs to test the service
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 3)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are bill runs', () => {
    beforeEach(async () => {
      await Promise.all([
        _addBillRun(1005, new Date('2024-03-01'), 10000, 1, 2, region.id),
        _addBillRun(1002, new Date('2023-01-01'), 20000, 3, 4, region.id),
        _addBillRun(1003, new Date('2024-01-01'), 30000, 5, 6, region.id),
        _addBillRun(1001, new Date('2022-10-01'), 30000, 7, 8, region.id),
        _addBillRun(1004, new Date('2024-02-01'), 30000, 9, 10, region.id)
      ])
    })

    describe('for the page selected', () => {
      beforeEach(async () => {
        page = 1
      })

      it('returns a result with the matching "results" and the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

        expect(...result.results).to.include({
          batchType: 'supplementary',
          billRunNumber: 1005,
          createdAt: new Date('2024-03-01'),
          netTotal: 10000,
          scheme: 'sroc',
          status: 'sent',
          summer: false,
          numberOfBills: 3,
          region: region.displayName
        })
        expect(result.results.length).to.equal(3)
        expect(result.total >= 5).to.be.true()
      })
    })

    describe('for the next page selected', () => {
      beforeEach(async () => {
        page = 2
      })

      it('returns a result with the matching "results" and the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

        expect(result.results.length >= 2).to.be.true()
        expect(result.total >= 5).to.be.true()
      })
    })

    describe('but not for the page selected', () => {
      beforeEach(async () => {
        page = 30
      })

      it('returns a result with no "results" but the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

        expect(result.results).to.be.empty()
        expect(result.total >= 5).to.be.true()
      })
    })
  })
})

function _addBillRun (billRunNumber, createdAt, netTotal, creditNoteCount, invoiceCount, regionId) {
  return BillRunHelper.add({
    billRunNumber,
    createdAt,
    netTotal,
    creditNoteCount,
    invoiceCount,
    regionId,
    status: 'sent'
  })
}
