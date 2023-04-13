'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
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
const FetchReplacedChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-replaced-charge-versions.service.js')

// Thing under test
const ProcessReplacedChargeVersionsService = require('../../../app/services/supplementary-billing/process-replaced-charge-versions.service.js')

describe.only('Process replaced charge versions service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let licence
  let changeReason
  let billingBatch
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const region = await RegionHelper.add()
    regionId = region.regionId
    licence = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true, regionId })
    changeReason = await ChangeReasonHelper.add()

    billingBatch = await BillingBatchHelper.add({ regionId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe('and there are no replaced charge versions to process', () => {
      beforeEach(() => {
        Sinon.stub(FetchReplacedChargeVersionsService, 'go').resolves([])
      })

      it('returns `true`', async () => {
        const result = await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        expect(result).to.be.true()
      })
    })

    describe('and there are replaced charge versions to process', () => {
      let supersededInvoiceAccount

      beforeEach(async () => {
        Sinon.stub(ChargingModuleCreateTransactionService, 'go').resolves({
          succeeded: true,
          response: {
            body: { transaction: { id: '7e752fa6-a19c-4779-b28c-6e536f028795' } }
          }
        })

        supersededInvoiceAccount = await InvoiceAccountHelper.add()

        // This creates an SROC charge version linked to a licence marked for supplementary billing
        // with a status of 'superseded'
        const srocSupersededChargeVersion = await ChargeVersionHelper.add(
          {
            endDate: new Date('2022-04-30'),
            status: 'superseded',
            invoiceAccountId: supersededInvoiceAccount.invoiceAccountId,
            changeReasonId: changeReason.changeReasonId
          },
          licence
        )

        const supersededBllingBatch = await BillingBatchHelper.add({ regionId, status: 'sent' })
        const supersededBillingInvoice = await BillingInvoiceHelper.add({ invoiceAccountId: supersededInvoiceAccount.invoiceAccountId }, supersededBllingBatch)
        const supersededBillingInvoiceLicence = await BillingInvoiceLicenceHelper.add({}, licence, supersededBillingInvoice)
        const { chargeElementId } = ChargeElementHelper.add({ chargeVersionId: srocSupersededChargeVersion.chargeVersionId })
        await ChargePurposeHelper.add({ chargeElementId })
        await BillingTransactionHelper.add({ billingInvoiceLicenceId: supersededBillingInvoiceLicence.billingInvoiceLicenceId, purposes: [] })
      })

      it('returns `false`', async () => {
        const result = await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        expect(result).to.be.false()
      })

      it('creates a new billingInvoice record', async () => {
        await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        const newBillingInvoice = await BillingInvoiceModel.query().where('billingBatchId', billingBatch.billingBatchId)
        expect(newBillingInvoice).to.have.length(1)
        expect(newBillingInvoice[0].invoiceAccountId).to.equal(supersededInvoiceAccount.invoiceAccountId)
      })

      it('creates a new billingInvoiceLicence record', async () => {
        await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        const billingInvoice = await BillingInvoiceModel.query()
          .findOne('billingBatchId', billingBatch.billingBatchId)
          .withGraphFetched('billingInvoiceLicences')
        expect(billingInvoice.billingInvoiceLicences).to.have.length(1)
        expect(billingInvoice.billingInvoiceLicences[0].licenceId).to.equal(licence.licenceId)
      })

      it('creates a new billingTransaction record', async () => {
        await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)
        const billingInvoice = await BillingInvoiceModel.query()
          .findOne('billingBatchId', billingBatch.billingBatchId)
          .withGraphFetched('billingInvoiceLicences.billingTransactions')
        const { billingTransactions } = billingInvoice.billingInvoiceLicences[0]
        expect(billingTransactions).to.have.length(1)
        expect(billingTransactions[0].isCredit).to.equal(true)
        expect(billingTransactions[0].status).to.equal('charge_created')
        expect(billingTransactions[0].externalId).to.equal('7e752fa6-a19c-4779-b28c-6e536f028795')
        expect(billingTransactions[0].billableDays).to.equal(BillingTransactionHelper.defaults().billableDays)
      })
    })
  })
})
