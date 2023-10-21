'use strict'

const { describe, it, beforeEach } = require('@jest/globals')
const { expect } = require('@jest/globals')

// Test helpers
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const CreateBillRunEventPresenter = require('../../../app/presenters/billing/create-bill-run-event.presenter.js')

describe('Create Bill Run Event presenter', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when a BillRunModel instance is provided', () => {
    let billRun

    beforeEach(async () => {
      const region = await RegionHelper.add()
      const testBillRun = await BillRunHelper.add({ regionId: region.regionId })

      billRun = await BillRunModel.query()
        .findById(testBillRun.billingBatchId)
        .withGraphFetched('region')
    })

    it('correctly presents the data', () => {
      const result = CreateBillRunEventPresenter.go(billRun)

      expect(result.batch).toBeDefined()
      expect(result.batch.id).toBe(billRun.billingBatchId)
      expect(result.batch.type).toBe(billRun.batchType)
      expect(result.batch.source).toBe(billRun.source)
      expect(result.batch.status).toBe(billRun.status)
      expect(result.batch.isSummer).toBe(billRun.isSummer)
      expect(result.batch.netTotal).toBe(billRun.netTotal)

      expect(result.batch.dateCreated).toBe(billRun.createdAt)
      expect(result.batch.dateUpdated).toBe(billRun.updatedAt)
      expect(result.batch.invoiceCount).toBe(billRun.invoiceCount)
      expect(result.batch.invoiceValue).toBe(billRun.invoiceValue)
      expect(result.batch.creditNoteCount).toBe(billRun.creditNoteCount)
      expect(result.batch.creditNoteValue).toBe(billRun.creditNoteValue)

      expect(result.batch.region).toEqual({
        id: billRun.region.regionId,
        code: billRun.region.chargeRegionId,
        name: billRun.region.name,
        type: 'region',
        displayName: billRun.region.displayName,
        numericCode: billRun.region.naldRegionId
      })

      expect(result.batch.endYear).toEqual({ yearEnding: billRun.toFinancialYearEnding })
      expect(result.batch.startYear).toEqual({ yearEnding: billRun.fromFinancialYearEnding })
    })
  })
})
