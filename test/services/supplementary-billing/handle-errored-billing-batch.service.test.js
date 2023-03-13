'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')

// Thing under test
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')

describe('Handle Errored Billing Batch service', () => {
  let billingBatch
  let notifierStub

  beforeEach(async () => {
    // RequestLib depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    billingBatch = await BillingBatchHelper.add()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called successfully', () => {
    it('sets the billing batch status to `error`', async () => {
      await HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

      const result = await billingBatch.$query()

      expect(result.status).to.equal('error')
    })

    describe('when no error code is passed', () => {
      it('doesn\'t set an error code', async () => {
        await HandleErroredBillingBatchService.go(billingBatch.billingBatchId)

        const result = await billingBatch.$query()

        expect(result.errorCode).to.be.null()
      })
    })

    describe('when an error code is passed', () => {
      it('does set an error code', async () => {
        await HandleErroredBillingBatchService.go(billingBatch.billingBatchId, 40)

        const result = await billingBatch.$query()

        expect(result.errorCode).to.equal(40)
      })
    })
  })

  describe('when the service is called unsuccessfully', () => {
    describe('because patching the billing batch fails', () => {
      it('handles the error', async () => {
        await expect(HandleErroredBillingBatchService.go(billingBatch.billingBatchId, 'INVALID_ERROR_CODE')).not.to.reject()
      })

      it('logs an error', async () => {
        // Note that we would not normally pass a string as an error code but we do this here to force the patch to fail
        // in lieu of a working method of stubbing Objection
        await HandleErroredBillingBatchService.go(billingBatch.billingBatchId, 'INVALID_ERROR_CODE')

        const logDataArg = notifierStub.omfg.firstCall.args[1]

        expect(notifierStub.omfg.calledWith('Failed to set error status on billing batch')).to.be.true()
        expect(logDataArg.billingBatchId).to.equal(billingBatch.billingBatchId)
        expect(logDataArg.errorCode).to.equal('INVALID_ERROR_CODE')
      })
    })
  })
})
