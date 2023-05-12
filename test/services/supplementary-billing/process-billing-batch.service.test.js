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
const LicenceModel = require('../../../app/models/water/licence.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const ChargingModuleCreateTransactionService = require('../../../app/services/charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('../../../app/services/charging-module/generate-bill-run.service.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const FetchInvoiceAccountNumbersService = require('../../../app/services/supplementary-billing/fetch-invoice-account-numbers.service.js')
const GenerateBillingTransactionsService = require('../../../app/services/supplementary-billing/generate-billing-transactions.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')

// Thing under test
const ProcessBillingBatchService = require('../../../app/services/supplementary-billing/process-billing-batch.service.js')

describe('Process billing batch service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let licence
  let changeReason
  let invoiceAccount
  let billingChargeCategory
  let billingBatch
  let handleErroredBillingBatchStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    licence = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true, regionId })
    changeReason = await ChangeReasonHelper.add()
    invoiceAccount = await InvoiceAccountHelper.add()
    billingChargeCategory = await BillingChargeCategoryHelper.add()

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

    describe('and there are charge versions to process', () => {
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

      describe('and some of them are billable', () => {
        beforeEach(async () => {
          const { chargeVersionId } = await ChargeVersionHelper.add(
            {
              changeReasonId: changeReason.changeReasonId,
              invoiceAccountId: invoiceAccount.invoiceAccountId,
              startDate: new Date(2022, 7, 1, 9),
              licenceId: licence.licenceId
            }
          )
          const { chargeElementId } = await ChargeElementHelper.add(
            { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
          )
          await ChargePurposeHelper.add({
            chargeElementId,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4,
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3
          })
        })

        it('sets the Billing Batch status to processing', async () => {
          await ProcessBillingBatchService.go(billingBatch, billingPeriod)

          const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

          expect(result.status).to.equal('processing')
        })
      })

      describe('but none of them are billable', () => {
        describe('because the billable days calculated as 0', () => {
          beforeEach(async () => {
            const { chargeVersionId } = await ChargeVersionHelper.add(
              {
                changeReasonId: changeReason.changeReasonId,
                invoiceAccountId: invoiceAccount.invoiceAccountId,
                startDate: new Date(2022, 7, 1, 9),
                licenceId: licence.licenceId
              }
            )
            const { chargeElementId } = await ChargeElementHelper.add(
              { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
            )
            await ChargePurposeHelper.add({
              chargeElementId,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 5
            })
          })

          describe('and there are no previous billed transactions', () => {
            it('sets the Billing Batch status to empty', async () => {
              await ProcessBillingBatchService.go(billingBatch, billingPeriod)

              const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

              expect(result.status).to.equal('empty')
            })

            it('sets the includeInSrocSupplementaryBilling flag to false', async () => {
              await ProcessBillingBatchService.go(billingBatch, billingPeriod)

              const result = await LicenceModel.query().findById(licence.licenceId)

              expect(result.includeInSrocSupplementaryBilling).to.equal(false)
            })
          })
        })

        describe('because the charge version status is `superseded`', () => {
          describe('and there are no previously billed transactions', () => {
            beforeEach(async () => {
              const { chargeVersionId } = await ChargeVersionHelper.add(
                {
                  changeReasonId: changeReason.changeReasonId,
                  invoiceAccountId: invoiceAccount.invoiceAccountId,
                  startDate: new Date(2022, 7, 1, 9),
                  licenceId: licence.licenceId,
                  status: 'superseded'
                }
              )
              const { chargeElementId } = await ChargeElementHelper.add(
                { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
              )
              await ChargePurposeHelper.add({
                chargeElementId,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 4,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3
              })
            })

            it('sets the Billing Batch status to empty', async () => {
              await ProcessBillingBatchService.go(billingBatch, billingPeriod)

              const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)

              expect(result.status).to.equal('empty')
            })

            it('sets the includeInSrocSupplementaryBilling flag to false', async () => {
              await ProcessBillingBatchService.go(billingBatch, billingPeriod)

              const result = await LicenceModel.query().findById(licence.licenceId)

              expect(result.includeInSrocSupplementaryBilling).to.equal(false)
            })
          })
        })
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

    describe('because fetching the invoice accounts fails', () => {
      beforeEach(() => {
        Sinon.stub(FetchInvoiceAccountNumbersService, 'go').rejects()
      })

      it('sets no error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        // Check that only the billing batch id was passed and not an error code as well
        expect(handlerArgs).to.have.length(1)
      })
    })

    describe('because generating the calculated transactions fails', () => {
      beforeEach(async () => {
        const { chargeVersionId } = await ChargeVersionHelper.add({
          changeReasonId: changeReason.changeReasonId,
          invoiceAccountId: invoiceAccount.invoiceAccountId,
          licenceId: licence.licenceId
        })
        const { chargeElementId } = await ChargeElementHelper.add(
          { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
        )
        await ChargePurposeHelper.add({ chargeElementId })

        Sinon.stub(GenerateBillingTransactionsService, 'go').throws()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToPrepareTransactions)
      })
    })

    describe('because creating the billing transactions fails', () => {
      beforeEach(async () => {
        const { chargeVersionId } = await ChargeVersionHelper.add({
          changeReasonId: changeReason.changeReasonId,
          invoiceAccountId: invoiceAccount.invoiceAccountId,
          licenceId: licence.licenceId
        })
        const { chargeElementId } = await ChargeElementHelper.add(
          { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
        )
        await ChargePurposeHelper.add({ chargeElementId })

        Sinon.stub(ChargingModuleCreateTransactionService, 'go').rejects()
      })

      it('sets the appropriate error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        expect(handlerArgs[1]).to.equal(BillingBatchModel.errorCodes.failedToCreateCharge)
      })
    })

    describe('because updating the status fails', () => {
      beforeEach(async () => {
        Sinon.stub(BillingBatchModel, 'query').returns({
          findById: Sinon.stub().throws()
        })
      })

      it('sets no error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        // Check that only the billing batch id was passed and not an error code as well
        expect(handlerArgs).to.have.length(1)
      })
    })

    describe('because finalising the billing batch fails', () => {
      beforeEach(async () => {
        const { chargeVersionId } = await ChargeVersionHelper.add({
          changeReasonId: changeReason.changeReasonId,
          invoiceAccountId: invoiceAccount.invoiceAccountId,
          licenceId: licence.licenceId
        })
        const { chargeElementId } = await ChargeElementHelper.add(
          { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
        )
        await ChargePurposeHelper.add({ chargeElementId })

        Sinon.stub(ChargingModuleCreateTransactionService, 'go').resolves({
          succeeded: true,
          response: {
            body: { transaction: { id: '7e752fa6-a19c-4779-b28c-6e536f028795' } }
          }
        })

        Sinon.stub(ChargingModuleGenerateService, 'go').rejects()
      })

      it('sets no error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        // Check that only the billing batch id was passed and not an error code as well
        expect(handlerArgs).to.have.length(1)
      })
    })

    describe('because creating the billing invoice licence fails', () => {
      beforeEach(async () => {
        const { chargeVersionId } = await ChargeVersionHelper.add({
          changeReasonId: changeReason.changeReasonId,
          invoiceAccountId: invoiceAccount.invoiceAccountId,
          licenceId: licence.licenceId
        })
        const { chargeElementId } = await ChargeElementHelper.add(
          { billingChargeCategoryId: billingChargeCategory.billingChargeCategoryId, chargeVersionId }
        )
        await ChargePurposeHelper.add({ chargeElementId })

        Sinon.stub(ChargingModuleCreateTransactionService, 'go').resolves({
          succeeded: true,
          response: {
            body: { transaction: { id: '7e752fa6-a19c-4779-b28c-6e536f028795' } }
          }
        })

        Sinon.stub(BillingInvoiceLicenceModel, 'query').returns({
          insert: Sinon.stub().throws()
        })
      })

      it('sets no error code', async () => {
        await ProcessBillingBatchService.go(billingBatch, billingPeriod)

        const handlerArgs = handleErroredBillingBatchStub.firstCall.args

        // Check that only the billing batch id was passed and not an error code as well
        expect(handlerArgs).to.have.length(1)
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
