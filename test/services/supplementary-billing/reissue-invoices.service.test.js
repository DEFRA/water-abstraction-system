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

function _generateCMTransaction (chargeValue, credit, rebilledTransactionId) {
  return {
    // TODO: remove fields we don't require for testing
    id: randomUUID({ disableEntropyCache: true }),
    chargeValue,
    credit,
    rebilledTransactionId,
    clientId: null,
    lineDescription: 'LINE_DESCRIPTION',
    periodStart: '2022-04-01T00:00:00.000Z',
    periodEnd: '2023-03-31T00:00:00.000Z',
    compensationCharge: false,
    section130Factor: 0.5,
    section127Factor: null,
    winterOnlyFactor: null,
    calculation: {
      // cut for brevity
    }
  }
}

const invoiceCommonFields = {
  billRunId: BILLING_BATCH_EXTERNAL_ID,
  ruleset: 'sroc',
  customerReference: 'CUSTOMER_REF',
  financialYear: 2022,
  deminimisInvoice: false,
  zeroValueInvoice: false,
  transactionReference: null,
  rebilledInvoiceId: INVOICE_EXTERNAL_ID
}

const CHARGING_MODULE_VIEW_INVOICE_RESPONSES = {
  credit: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices.find(invoice => invoice.rebilledType === 'C').id,
      ...invoiceCommonFields,
      creditLineValue: 13200,
      debitLineValue: 0,
      netTotal: -13200,
      rebilledType: 'C',
      licences: [
        {
          id: 'fb79cde3-c684-4078-b08f-be6f06eb51a0',
          licenceNumber: 'FIRST_LICENCE',
          netTotal: -6600,
          transactions: [
            _generateCMTransaction(6600, true, 'a844ec8e-7ee1-4771-b645-a2459045a31a')
          ]
        },
        {
          id: '5449e9cf-b0f0-4601-91f7-cac674b8351c',
          licenceNumber: 'SECOND_LICENCE',
          netTotal: -6600,
          transactions: [
            _generateCMTransaction(6600, true, '5410a73f-bd2c-4565-b70b-af36956c093a')
          ]
        }
      ]
    }
  },
  reissue: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices.find(invoice => invoice.rebilledType === 'R').id,
      ...invoiceCommonFields,
      creditLineValue: 0,
      debitLineValue: 13200,
      netTotal: 13200,
      rebilledType: 'R',
      licences: [
        {
          id: 'c11c33e2-bbb0-46e6-a6be-707ae57762de',
          licenceNumber: 'FIRST_LICENCE',
          netTotal: 6600,
          transactions: [
            _generateCMTransaction(6600, false, 'a844ec8e-7ee1-4771-b645-a2459045a31a')
          ]
        },
        {
          id: 'c11c33e2-bbb0-46e6-a6be-707ae57762de',
          licenceNumber: 'SECOND_LICENCE',
          netTotal: 6600,
          transactions: [
            _generateCMTransaction(6600, false, '5410a73f-bd2c-4565-b70b-af36956c093a')
          ]
        }
      ]
    }
  }
}

describe.only('Reissue invoices service', () => {
  let billingTransactionToReissue
  let invoiceToReissue
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
        const billingInvoiceToReissue = await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: originalBillingBatch.billingBatchId, isFlaggedForRebilling: true, externalId: INVOICE_EXTERNAL_ID })

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
    })
  })
})
