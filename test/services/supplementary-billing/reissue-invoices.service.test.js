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

const BILLING_BATCH_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })

const INVOICE_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_EXTERNAL_ID_2 = randomUUID({ disableEntropyCache: true })

const INVOICE_1_LICENCE_1_TRANSACTION_1_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_1_LICENCE_2_TRANSACTION_1_ID = randomUUID({ disableEntropyCache: true })

const INVOICE_2_LICENCE_1_TRANSACTION_1_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_2_LICENCE_2_TRANSACTION_1_ID = randomUUID({ disableEntropyCache: true })

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    {
      id: randomUUID({ disableEntropyCache: true }),
      rebilledType: 'C'
    },
    {
      id: randomUUID({ disableEntropyCache: true }),
      rebilledType: 'R'
    }
  ]
}

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE_2 = {
  invoices: [
    {
      id: randomUUID({ disableEntropyCache: true }),
      rebilledType: 'C'
    },
    {
      id: randomUUID({ disableEntropyCache: true }),
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
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_1_LICENCE_1',
          transactions: [
            _generateCMTransaction(true, INVOICE_1_LICENCE_1_TRANSACTION_1_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_1_LICENCE_2',
          transactions: [
            _generateCMTransaction(true, INVOICE_1_LICENCE_2_TRANSACTION_1_ID)
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
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_1_LICENCE_1',
          transactions: [
            _generateCMTransaction(false, INVOICE_1_LICENCE_1_TRANSACTION_1_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_1_LICENCE_2',
          transactions: [
            _generateCMTransaction(false, INVOICE_1_LICENCE_2_TRANSACTION_1_ID)
          ]
        }
      ]
    }
  }
}

const CHARGING_MODULE_VIEW_INVOICE_RESPONSES_2 = {
  credit: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE_2.invoices[0].id,
      billRunId: BILLING_BATCH_EXTERNAL_ID,
      rebilledInvoiceId: INVOICE_EXTERNAL_ID_2,
      rebilledType: 'C',
      licences: [
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_2_LICENCE_1',
          transactions: [
            _generateCMTransaction(true, INVOICE_2_LICENCE_1_TRANSACTION_1_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_2_LICENCE_2',
          transactions: [
            _generateCMTransaction(true, INVOICE_2_LICENCE_2_TRANSACTION_1_ID)
          ]
        }
      ]
    }
  },
  reissue: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE_2.invoices[1].id,
      billRunId: BILLING_BATCH_EXTERNAL_ID,
      rebilledInvoiceId: INVOICE_EXTERNAL_ID_2,
      rebilledType: 'R',
      licences: [
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_2_LICENCE_1',
          transactions: [
            _generateCMTransaction(false, INVOICE_2_LICENCE_1_TRANSACTION_1_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_2_LICENCE_2',
          transactions: [
            _generateCMTransaction(false, INVOICE_2_LICENCE_2_TRANSACTION_1_ID)
          ]
        }
      ]
    }
  }
}

describe.only('Reissue invoices service', () => {
  let billingInvoiceToReissue
  let billingInvoiceToReissue2
  let billingTransactionToReissue
  let chargingModuleReissueInvoiceServiceStub
  let chargingModuleViewInvoiceServiceStub
  let legacyRequestLibStub
  let notifierStub
  let reissueBillingBatch
  let originalBillingBatch

  beforeEach(async () => {
    await DatabaseHelper.clean()

    originalBillingBatch = await BillingBatchHelper.add({ externalId: BILLING_BATCH_EXTERNAL_ID })
    reissueBillingBatch = await BillingBatchHelper.add()

    chargingModuleReissueInvoiceServiceStub = Sinon.stub(ChargingModuleReissueInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE
      })
      .withArgs(BILLING_BATCH_EXTERNAL_ID, INVOICE_EXTERNAL_ID_2)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE_2
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
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES_2.credit.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES_2.credit
      })
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES_2.reissue.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES_2.reissue
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
        billingInvoiceToReissue2 = await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: originalBillingBatch.billingBatchId, isFlaggedForRebilling: true, externalId: INVOICE_EXTERNAL_ID_2 })

        const billingInvoiceLicencesToReissue = await Promise.all([
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue.billingInvoiceId, licenceRef: 'INVOICE_1_LICENCE_1' }),
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue.billingInvoiceId, licenceRef: 'INVOICE_1_LICENCE_2' })
        ])

        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue[0].billingInvoiceLicenceId, externalId: INVOICE_1_LICENCE_1_TRANSACTION_1_ID, description: 'INVOICE_1_LICENCE_1_TRANSACTION_1' })
        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue[1].billingInvoiceLicenceId, externalId: INVOICE_1_LICENCE_2_TRANSACTION_1_ID, description: 'INVOICE_1_LICENCE_2_TRANSACTION_1' })

        const billingInvoiceLicencesToReissue2 = await Promise.all([
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue2.billingInvoiceId, licenceRef: 'INVOICE_2_LICENCE_1' }),
          BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue2.billingInvoiceId, licenceRef: 'INVOICE_2_LICENCE_2' })
        ])

        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue2[0].billingInvoiceLicenceId, externalId: INVOICE_2_LICENCE_1_TRANSACTION_1_ID, description: 'INVOICE_2_LICENCE_1_TRANSACTION_1' })
        await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicencesToReissue2[1].billingInvoiceLicenceId, externalId: INVOICE_2_LICENCE_2_TRANSACTION_1_ID, description: 'INVOICE_2_LICENCE_2_TRANSACTION_1' })
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

        expect(result).to.have.length(4)
      })

      it('persists replacement transactions', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const transactions = await BillingTransactionModel.query()
          .joinRelated('billingInvoiceLicence.billingInvoice')
          .where('billingInvoiceLicence:billingInvoice.billingBatchId', reissueBillingBatch.billingBatchId)

        const result = transactions.filter(t => t.isCredit === false)

        expect(result).to.have.length(4)
      })

      it('persists two billing invoices per source invoice (one cancelling, one reissuing)', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const billingInvoices = await BillingInvoiceModel.query()
          .where({ billingBatchId: reissueBillingBatch.billingBatchId })

        expect(billingInvoices).to.have.length(4)
      })

      it('persists two billing invoice licences per source invoice licence (once cancelling, one reissuing)', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const billingInvoiceLicences = await BillingInvoiceLicenceModel.query()
          .joinRelated('billingInvoice')
          .where('billingInvoice.billingBatchId', reissueBillingBatch.billingBatchId)

        expect(billingInvoiceLicences).to.have.length(8)
      })

      it('persists two billing transactions per source transaction (once cancelling, one reissuing)', async () => {
        await ReissueInvoicesService.go(originalBillingBatch, reissueBillingBatch)

        const transactions = await BillingTransactionModel.query()
          .joinRelated('billingInvoiceLicence.billingInvoice')
          .where('billingInvoiceLicence:billingInvoice.billingBatchId', reissueBillingBatch.billingBatchId)

        expect(transactions).to.have.length(8)
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
