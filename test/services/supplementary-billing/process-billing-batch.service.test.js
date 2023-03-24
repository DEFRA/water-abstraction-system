'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const ChargingModuleCreateTransactionService = require('../../../app/services/charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('../../../app/services/charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const GenerateBillingTransactionsService = require('../../../app/services/supplementary-billing/generate-billing-transactions.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe.only('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let billingBatch
  let handleErroredBillingBatchStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    const { licenceId } = await LicenceHelper.add({ includeInSrocSupplementaryBilling: 'yes', regionId })
    const { changeReasonId } = await ChangeReasonHelper.add()
    const { invoiceAccountId } = await InvoiceAccountHelper.add()
    const { chargeVersionId } = await ChargeVersionHelper.add({ changeReasonId, invoiceAccountId }, { licenceId })
    const { billingChargeCategoryId } = await BillingChargeCategoryHelper.add()
    const { chargeElementId } = await ChargeElementHelper.add({ billingChargeCategoryId, chargeVersionId })
    await ChargePurposeHelper.add({ chargeElementId })

    billingBatch = await BillingBatchHelper.add({ regionId })

    // RequestLib depends on the GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub

    handleErroredBillingBatchStub = Sinon.stub(HandleErroredBillingBatchService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no charge versions to process', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
      })

      it('sets the Billing Batch status to empty', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

        expect(result.status).to.equal('empty')
      })
    })

    beforeEach(() => {
      Sinon.stub(ChargingModuleCreateTransactionService, 'go').resolves({
        succeeded: true,
        response: {
          body: { transaction: { id: '7e752fa6-a19c-4779-b28c-6e536f028795' } }
        }
      })
      Sinon.stub(ChargingModuleGenerateService, 'go').resolves({
        succeeded: true,
        response: {}
      })
    })

    it('logs the time taken to process the billing batch', async () => {
      await ProcessBillingBatchService.go(billingBatch, billingPeriod)

      const logMessage = notifierStub.omg.firstCall.args[0]

      expect(logMessage).to.startWith(`Time taken to process billing batch ${billingBatch.billingBatchId}:`)
    })
  })

  describe('when the service errors', () => {
    const expectedError = new Error('ERROR')

    describe('because fetching the charge versions fails', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').rejects()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToProcessChargeVersions)
      })
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(() => {
        Sinon.stub(GenerateBillingTransactionsService, 'go').throws()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because creating the billing transactions', () => {
      beforeEach(() => {
        Sinon.stub(ChargingModuleCreateTransactionService, 'go').rejects()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToCreateCharge)
      })
    })

    describe('no matter the reason', () => {
      beforeEach(() => {
        Sinon.stub(FetchChargeVersionsService, 'go').rejects(expectedError)
      })

      it('handles the error', async () => {
        await expect(ProcessBillingBatchService.go(billingBatch, billingPeriod)).not.to.reject()
      })

      it('sets the Billing Batch status to errored', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[0]).to.equal(billingBatch.billingBatchId)
      })

      it('logs the error', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const logDataArg = notifierStub.omfg.firstCall.args[1]

        expect(notifierStub.omfg.calledWith('Billing Batch process errored')).to.be.true()
        expect(logDataArg.billingBatch).to.equal(billingBatch)
        expect(logDataArg.error).to.equal({
          name: expectedError.name,
          message: expectedError.message,
          stack: expectedError.stack
        })
      })
    })
  })
})
