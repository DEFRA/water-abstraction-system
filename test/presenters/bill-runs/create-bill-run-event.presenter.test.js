'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const CreateBillRunEventPresenter = require('../../../app/presenters/bill-runs/create-bill-run-event.presenter.js')

describe('Create Bill Run Event presenter', () => {
  describe('when a BillRunModel instance is provided', () => {
    let billRun

    beforeEach(async () => {
      const region = RegionHelper.select()
      const testBillRun = await BillRunHelper.add({ regionId: region.id })

      billRun = await BillRunModel.query()
        .findById(testBillRun.id)
        .withGraphFetched('region')
    })

    it('correctly presents the data', () => {
      const result = CreateBillRunEventPresenter.go(billRun)

      expect(result.batch).to.exist()
      expect(result.batch.id).to.equal(billRun.id)
      expect(result.batch.type).to.equal(billRun.batchType)
      expect(result.batch.source).to.equal(billRun.source)
      expect(result.batch.status).to.equal(billRun.status)
      expect(result.batch.summer).to.equal(billRun.summer)
      expect(result.batch.netTotal).to.equal(billRun.netTotal)

      expect(result.batch.dateCreated).to.equal(billRun.createdAt)
      expect(result.batch.dateUpdated).to.equal(billRun.updatedAt)
      expect(result.batch.invoiceCount).to.equal(billRun.invoiceCount)
      expect(result.batch.invoiceValue).to.equal(billRun.invoiceValue)
      expect(result.batch.creditNoteCount).to.equal(billRun.creditNoteCount)
      expect(result.batch.creditNoteValue).to.equal(billRun.creditNoteValue)

      expect(result.batch.region).to.equal({
        id: billRun.region.id,
        code: billRun.region.chargeRegionId,
        name: billRun.region.name,
        type: 'region',
        displayName: billRun.region.displayName,
        numericCode: billRun.region.naldRegionId
      })

      expect(result.batch.endYear).to.equal({ yearEnding: billRun.toFinancialYearEnding })
      expect(result.batch.startYear).to.equal({ yearEnding: billRun.fromFinancialYearEnding })
    })
  })
})
