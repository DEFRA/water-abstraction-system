'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, before, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const DatabaseConfig = require('../../../config/database.config.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')

describe('Fetch Bill Runs service', () => {
  const region = RegionHelper.select()

  let page

  beforeEach(async () => {
    // Set the default page size to 3 so we don't have to create loads of bill runs to test the service
    Sinon.replace(DatabaseConfig, 'defaultPageSize', 3)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when there are bill runs', () => {
    before(async () => {
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

      it('returns a result with the correct properties', async () => {
        const { results } = await FetchBillRunsService.go(page)

        // Due to the number of other bill runs created by other tests we can't assert on the exact values.
        // Instead we just check that the object returned contains the properties we expect
        expect('id' in results[0]).to.be.true()
        expect('batchType' in results[0]).to.be.true()
        expect('billRunNumber' in results[0]).to.be.true()
        expect('createdAt' in results[0]).to.be.true()
        expect('netTotal' in results[0]).to.be.true()
        expect('scheme' in results[0]).to.be.true()
        expect('status' in results[0]).to.be.true()
        expect('summer' in results[0]).to.be.true()
        expect('numberOfBills' in results[0]).to.be.true()
        expect('region' in results[0]).to.be.true()
      })
    })

    describe('for the page selected', () => {
      beforeEach(async () => {
        page = 1
      })

      it('returns a full page of 3 matching "results" and the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

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
        page = 500
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
