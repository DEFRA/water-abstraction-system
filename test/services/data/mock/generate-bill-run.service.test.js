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
const GenerateBillRunService = require('../../../../app/services/data/mock/generate-bill-run.service.js')

describe('Generate Bill Run service', () => {
  let billingBatchId

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when a billing batch with a matching ID exists', () => {
    beforeEach(async () => {
      const billingBatch = await BillingBatchHelper.add()

      billingBatchId = billingBatch.billingBatchId
    })

    it('returns the generated bill run', async () => {
      const result = await GenerateBillRunService.go(billingBatchId)

      expect(result.billingBatchId).to.equal(billingBatchId)
    })
  })

  describe('when a billing batch with a matching ID does not exist', () => {
    beforeEach(() => {
      billingBatchId = 'b845bcc3-a5bd-4e42-9ed2-b3e27a837e85'
    })

    it('throws an error', async () => {
      const error = await expect(GenerateBillRunService.go(billingBatchId)).to.reject()

      expect(error).to.be.an.error()
      expect(error.message).to.equal('No matching bill run exists')
    })
  })
})
