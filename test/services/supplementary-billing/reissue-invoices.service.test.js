'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const { randomUUID } = require('crypto')

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Things we need to stub
const ChargingModuleReissueInvoiceService = require('../../../app/services/charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../../../app/services/charging-module/view-invoice.service.js')
const LegacyRequestLib = require('../../../app/lib/legacy-request.lib.js')

// Thing under test
const ReissueInvoicesService = require('../../../app/services/supplementary-billing/reissue-invoices.service.js')
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')

const BILLING_BATCH_EXTERNAL_ID = 'f68fedc4-bb26-43b9-9c69-504ba7d2ca18'
const INVOICE_EXTERNAL_ID = '1699fe7c-c4ff-4b4b-a1b8-3026b83a00a1'

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    {
      id: 'f62faabc-d65e-4242-a106-9777c1d57db7',
      rebilledType: 'C'
    },
    {
      id: 'db82bf38-638a-44d3-b1b3-1ae8524d9c38',
      rebilledType: 'R'
    }
  ]
}

const CHARGING_MODULE_VIEW_INVOICE_RESPONSES = {
  credit: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id,
      billRunId: BILLING_BATCH_EXTERNAL_ID,
      rebilledInvoiceId: INVOICE_EXTERNAL_ID,
      rebilledType: 'C',
      licences: [
        {
          id: 'fb79cde3-c684-4078-b08f-be6f06eb51a0',
          licenceNumber: 'FIRST_LICENCE',
          transactions: [
            _generateCMTransaction(true, 'a844ec8e-7ee1-4771-b645-a2459045a31a')
          ]
        },
        {
          id: '5449e9cf-b0f0-4601-91f7-cac674b8351c',
          licenceNumber: 'SECOND_LICENCE',
          transactions: [
            _generateCMTransaction(true, '5410a73f-bd2c-4565-b70b-af36956c093a')
          ]
        }
      ]
    }
  },
  reissue: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[1].id,
      billRunId: BILLING_BATCH_EXTERNAL_ID,
      rebilledInvoiceId: INVOICE_EXTERNAL_ID,
      rebilledType: 'R',
      licences: [
        {
          id: 'c11c33e2-bbb0-46e6-a6be-707ae57762de',
          licenceNumber: 'FIRST_LICENCE',
          transactions: [
            _generateCMTransaction(false, 'a844ec8e-7ee1-4771-b645-a2459045a31a')
          ]
        },
        {
          id: 'c11c33e2-bbb0-46e6-a6be-707ae57762de',
          licenceNumber: 'SECOND_LICENCE',
          transactions: [
            _generateCMTransaction(false, '5410a73f-bd2c-4565-b70b-af36956c093a')
          ]
        }
      ]
    }
  }
}

describe.only('Reissue invoices service', () => {
  let billingInvoiceToReissue
  let billingTransactionToReissue
  let chargingModuleReissueInvoiceServiceStub
  let chargingModuleViewInvoiceServiceStub
  let legacyRequestLibStub
  let notifierStub
  let reissueBillingBatch
  let originalBillingBatch

  beforeEach(async () => {
    await DatabaseHelper.clean()

    reissueBillingBatch = await BillingBatchHelper.add()

    originalBillingBatch = await BillingBatchHelper.add({ externalId: BILLING_BATCH_EXTERNAL_ID })
    await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: originalBillingBatch.billingBatchId })

    chargingModuleReissueInvoiceServiceStub = Sinon.stub(ChargingModuleReissueInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE
      })

    chargingModuleViewInvoiceServiceStub = Sinon.stub(ChargingModuleViewInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES.credit.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES.credit
      })
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES.reissue.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES.reissue
      })

    legacyRequestLibStub = Sinon.stub(LegacyRequestLib, 'post')

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      // Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
      // Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and there are no invoices to reissue', () => {
      it('returns `false`', async () => {
        const result = await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        expect(result).to.be.false()
      })
    })

    describe('and there are invoices to reissue', () => {
      beforeEach(async () => {
        billingInvoiceToReissue = await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: originalBillingBatch.billingBatchId, isFlaggedForRebilling: true, externalId: INVOICE_EXTERNAL_ID })

        const billingInvoiceLicencesToReissue = await Promise.all([
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue.billingInvoiceId, licenceRef: 'FIRST_LICENCE' }),
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue.billingInvoiceId, licenceRef: 'SECOND_LICENCE' })
        ])

        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue[0].billingInvoiceLicenceId, externalId: 'a844ec8e-7ee1-4771-b645-a2459045a31a', description: 'FIRST_TRANSACTION' })
        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue[1].billingInvoiceLicenceId, externalId: '5410a73f-bd2c-4565-b70b-af36956c093a', description: 'SECOND_TRANSACTION' })
      })

      it('returns `true`', async () => {
        const result = await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        expect(result).to.be.true()
      })

      it('persists cancelling transactions', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const transactions = await BillingTransactionModel.query()
          .joinRelated('billingInvoiceLicence.billingInvoice')
          .where('billingInvoiceLicence:billingInvoice.billingBatchId', reissueBillingBatch.billingBatchId)

        const result = transactions.filter(t => t.isCredit === true)

        expect(result).to.have.length(2)
      })

      it('persists replacement transactions', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const transactions = await BillingTransactionModel.query()
          .joinRelated('billingInvoiceLicence.billingInvoice')
          .where('billingInvoiceLicence:billingInvoice.billingBatchId', reissueBillingBatch.billingBatchId)

        const result = transactions.filter(t => t.isCredit === false)

        expect(result).to.have.length(2)
      })

      it('persists one billing invoice licences per source invoice licence', async () => {
        const billingInvoiceLicences = await BillingInvoiceLicenceModel.query()

        expect(billingInvoiceLicences).to.have.length(2)
      })

      it('sets the source invoice rebilling state to `rebilled`', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        // Re-query the billing invoice to refresh it
        billingInvoiceToReissue = await billingInvoiceToReissue.$query()

        expect(billingInvoiceToReissue.rebillingState).to.equal('rebilled')
      })

      describe('sets the original billing invoice id', () => {
        it('to its own id if `null`', async () => {
          await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

          billingInvoiceToReissue = await billingInvoiceToReissue.$query()

          expect(billingInvoiceToReissue.originalBillingInvoiceId).to.equal(billingInvoiceToReissue.billingInvoiceId)
        })

        it("to the existing value if it's populated", async () => {
          await billingInvoiceToReissue.$query().patch({ originalBillingInvoiceId: '7decbddc-4b17-4eeb-9124-5d1e75c3d79a' })

          await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

          billingInvoiceToReissue = await billingInvoiceToReissue.$query()

          expect(billingInvoiceToReissue.originalBillingInvoiceId).to.equal('7decbddc-4b17-4eeb-9124-5d1e75c3d79a')
        })
      })
    })
  })
})

function _generateCMTransaction (credit, rebilledTransactionId) {
  return {
    id: randomUUID({ disableEntropyCache: true }),
    credit,
    rebilledTransactionId
  }
}
