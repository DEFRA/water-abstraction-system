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

// Things we need to stub
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billingBatch
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    // RequestLib depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service errors', () => {
    beforeEach(async () => {
      billingBatch = await BillingBatchHelper.add()

      Sinon.stub(FetchChargeVersionsService, 'go').rejects()
    })

    it('handles the error', async () => {
      await expect(ProcessBillingBatchService.go(billingBatch, billingPeriod)).not.to.reject()
    })
  })
})
