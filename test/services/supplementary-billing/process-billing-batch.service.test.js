'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe.skip('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let billingBatch

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(async () => {
      billingBatch = await BillingBatchHelper.add()
    })

    it('does something temporarily as it is just a placeholder at the moment', async () => {
      await expect(ProcessBillingBatchService.go(billingBatch, billingPeriod)).not.to.reject()
    })
  })
})
