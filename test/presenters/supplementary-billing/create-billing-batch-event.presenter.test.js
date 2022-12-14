'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const CreateBillingBatchEventPresenter = require('../../../app/presenters/supplementary-billing/create-billing-batch-event.presenter.js')

describe('Create Billing Batch Event presenter', () => {
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when a BillingBatchModel instance is provided', () => {
    let billingBatch

    beforeEach(async () => {
      const region = await RegionHelper.add()
      const testBillingBatch = await BillingBatchHelper.add({ regionId: region.regionId })

      billingBatch = await BillingBatchModel.query()
        .findById(testBillingBatch.billingBatchId)
        .withGraphFetched('region')
    })

    it('correctly presents the data', () => {
      const result = CreateBillingBatchEventPresenter.go(billingBatch)

      expect(result.batch).to.exist()
      expect(result.batch.id).to.equal(billingBatch.billingBatchId)
      expect(result.batch.type).to.equal(billingBatch.batchType)
      expect(result.batch.source).to.equal(billingBatch.source)
      expect(result.batch.status).to.equal(billingBatch.status)
      expect(result.batch.isSummer).to.equal(billingBatch.isSummer)
      expect(result.batch.netTotal).to.equal(billingBatch.netTotal)

      expect(result.batch.dateCreated).to.equal(billingBatch.dateCreated)
      expect(result.batch.dateUpdated).to.equal(billingBatch.dateUpdated)
      expect(result.batch.invoiceCount).to.equal(billingBatch.invoiceCount)
      expect(result.batch.invoiceValue).to.equal(billingBatch.invoiceValue)
      expect(result.batch.creditNoteCount).to.equal(billingBatch.creditNoteCount)
      expect(result.batch.creditNoteValue).to.equal(billingBatch.creditNoteValue)

      expect(result.batch.region).to.equal({
        id: billingBatch.region.regionId,
        code: billingBatch.region.chargeRegionId,
        name: billingBatch.region.name,
        type: 'region',
        displayName: billingBatch.region.displayName,
        numericCode: billingBatch.region.naldRegionId
      })

      expect(result.batch.endYear).to.equal({ yearEnding: billingBatch.toFinancialYearEnding })
      expect(result.batch.startYear).to.equal({ yearEnding: billingBatch.fromFinancialYearEnding })
    })
  })
})
