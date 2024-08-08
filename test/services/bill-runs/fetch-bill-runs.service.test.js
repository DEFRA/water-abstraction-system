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
const DatabaseSupport = require('../../support/database.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchBillRunsService = require('../../../app/services/bill-runs/fetch-bill-runs.service.js')

describe('Fetch Bill Runs service', () => {
  let page
  let region

  beforeEach(async () => {
    await DatabaseSupport.clean()

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
        page = 2
      })

      it('returns a result with the matching "results" and the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

        expect(result.results).to.equal([
          {
            batchType: 'supplementary',
            billRunNumber: 1002,
            createdAt: new Date('2023-01-01'),
            netTotal: 20000,
            scheme: 'sroc',
            status: 'sent',
            summer: false,
            numberOfBills: 7,
            region: region.displayName
          },
          {
            batchType: 'supplementary',
            billRunNumber: 1001,
            createdAt: new Date('2022-10-01'),
            netTotal: 30000,
            scheme: 'sroc',
            status: 'sent',
            summer: false,
            numberOfBills: 15,
            region: region.displayName
          }
        ], { skip: ['id'] })
        expect(result.total).to.equal(5)
      })
    })

    describe('but not for the page selected', () => {
      beforeEach(async () => {
        page = 3
      })

      it('returns a result with no "results" but the correct "total"', async () => {
        const result = await FetchBillRunsService.go(page)

        expect(result.results).to.be.empty()
        expect(result.total).to.equal(5)
      })
    })
  })

  describe('when there are no bill runs', () => {
    it('returns a result with no "results" and 0 for "total"', async () => {
      const result = await FetchBillRunsService.go()

      expect(result.results).to.be.empty()
      expect(result.total).to.equal(0)
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
