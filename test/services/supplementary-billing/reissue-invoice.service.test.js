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
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../app/models/water/billing-transaction.model.js')

// Things we need to stub
const ChargingModuleReissueInvoiceService = require('../../../app/services/charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../../../app/services/charging-module/view-invoice.service.js')

// Thing under test
const ReissueInvoiceService = require('../../../app/services/supplementary-billing/reissue-invoice.service.js')

const BILLING_BATCH_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_LICENCE_1_TRANSACTION_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_LICENCE_2_TRANSACTION_ID = randomUUID({ disableEntropyCache: true })

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    { id: randomUUID({ disableEntropyCache: true }), rebilledType: 'C' },
    { id: randomUUID({ disableEntropyCache: true }), rebilledType: 'R' }
  ]
}

const CHARGING_MODULE_VIEW_INVOICE_RESPONSES = {
  credit: {
    invoice: {
      id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id,
      billRunId: BILLING_BATCH_EXTERNAL_ID,
      rebilledInvoiceId: INVOICE_EXTERNAL_ID,
      rebilledType: 'C',
      netTotal: -2000,
      deminimisInvoice: false,
      debitLineValue: 0,
      creditLineValue: 2000,
      licences: [
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_LICENCE_1',
          transactions: [
            _generateCMTransaction(true, INVOICE_LICENCE_1_TRANSACTION_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_LICENCE_2',
          transactions: [
            _generateCMTransaction(true, INVOICE_LICENCE_2_TRANSACTION_ID)
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
      netTotal: 2000,
      deminimisInvoice: false,
      debitLineValue: 2000,
      creditLineValue: 0,
      licences: [
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_LICENCE_1',
          transactions: [
            _generateCMTransaction(false, INVOICE_LICENCE_1_TRANSACTION_ID)
          ]
        },
        {
          id: randomUUID({ disableEntropyCache: true }),
          licenceNumber: 'INVOICE_LICENCE_2',
          transactions: [
            _generateCMTransaction(false, INVOICE_LICENCE_2_TRANSACTION_ID)
          ]
        }
      ]
    }
  }
}

describe('Reissue invoice service', () => {
  let reissueBillingBatch
  let originalBillingBatch
  let sourceInvoice

  beforeEach(async () => {
    originalBillingBatch = BillingBatchModel.fromJson({
      ...BillingBatchHelper.defaults(),
      externalId: BILLING_BATCH_EXTERNAL_ID
    })
    reissueBillingBatch = BillingBatchModel.fromJson({ ...BillingBatchHelper.defaults() })

    Sinon.stub(ChargingModuleReissueInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE
      })

    Sinon.stub(ChargingModuleViewInvoiceService, 'go')
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

    const SOURCE_BILLING_INVOICE_ID = randomUUID({ disableEntropyCache: true })

    sourceInvoice = BillingInvoiceModel.fromJson({
      ...BillingInvoiceHelper.defaults(),
      billingInvoiceId: SOURCE_BILLING_INVOICE_ID,
      billingBatchId: BILLING_BATCH_EXTERNAL_ID,
      externalId: INVOICE_EXTERNAL_ID,
      isFlaggedForRebilling: true,
      billingInvoiceLicences: [
        BillingInvoiceLicenceModel.fromJson({
          billingInvoiceId: SOURCE_BILLING_INVOICE_ID,
          licenceRef: 'INVOICE_LICENCE_1',
          billingTransactions: [
            BillingTransactionModel.fromJson({
              ...BillingTransactionHelper.defaults(),
              externalId: INVOICE_LICENCE_1_TRANSACTION_ID
            })
          ]
        }),
        BillingInvoiceLicenceModel.fromJson({
          billingInvoiceId: SOURCE_BILLING_INVOICE_ID,
          licenceRef: 'INVOICE_LICENCE_2',
          billingTransactions: [
            BillingTransactionModel.fromJson({
              ...BillingTransactionHelper.defaults(),
              externalId: INVOICE_LICENCE_2_TRANSACTION_ID
            })
          ]
        })
      ]
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('returns two billing invoices per source invoice (one cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

      expect(result.reissueBillingInvoices).to.have.length(2)
    })

    it('returns two billing invoice licences per source invoice licence (once cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

      expect(result.reissueBillingInvoiceLicences).to.have.length(4)
    })

    it('persists two transactions per source transaction (once cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

      expect(result.reissueTransactions).to.have.length(4)
    })

    it('sets the source invoice rebilling state to `rebilled`', async () => {
      await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

      expect(sourceInvoice.rebillingState).to.equal('rebilled')
    })

    describe('sets the original billing invoice id', () => {
      it('to its own id if `null`', async () => {
        await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

        expect(sourceInvoice.originalBillingInvoiceId).to.equal(sourceInvoice.billingInvoiceId)
      })

      it("to the existing value if it's populated", async () => {
        const ORIGINAL_BILLING_INVOICE_ID = randomUUID({ disableEntropyCache: true })
        await sourceInvoice.$query().patch({ originalBillingInvoiceId: ORIGINAL_BILLING_INVOICE_ID })

        await ReissueInvoiceService.go(sourceInvoice, originalBillingBatch, reissueBillingBatch)

        expect(sourceInvoice.originalBillingInvoiceId).to.equal(ORIGINAL_BILLING_INVOICE_ID)
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
