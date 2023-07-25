'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const { randomUUID } = require('crypto')

// Test helpers
const BillingInvoiceHelper = require('../../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Things we need to stub
const ChargingModuleBillRunStatusService = require('../../../../app/services/charging-module/bill-run-status.service.js')
const ChargingModuleReissueInvoiceService = require('../../../../app/services/charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../../../../app/services/charging-module/view-invoice.service.js')

// Thing under test
const ReissueInvoiceService = require('../../../../app/services/billing/supplementary/reissue-invoice.service.js')

const ORIGINAL_BILLING_BATCH_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_EXTERNAL_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_LICENCE_1_TRANSACTION_ID = randomUUID({ disableEntropyCache: true })
const INVOICE_LICENCE_2_TRANSACTION_ID = randomUUID({ disableEntropyCache: true })

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    { id: randomUUID({ disableEntropyCache: true }), rebilledType: 'C' },
    { id: randomUUID({ disableEntropyCache: true }), rebilledType: 'R' }
  ]
}

const CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE = {
  invoice: {
    id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id,
    billRunId: ORIGINAL_BILLING_BATCH_EXTERNAL_ID,
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
        transactions: [_generateCMTransaction(true, INVOICE_LICENCE_1_TRANSACTION_ID)]
      },
      {
        id: randomUUID({ disableEntropyCache: true }),
        licenceNumber: 'INVOICE_LICENCE_2',
        transactions: [_generateCMTransaction(true, INVOICE_LICENCE_2_TRANSACTION_ID)]
      }
    ]
  }
}

const CHARGING_MODULE_VIEW_INVOICE_REISSUE_RESPONSE = {
  invoice: {
    id: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[1].id,
    billRunId: ORIGINAL_BILLING_BATCH_EXTERNAL_ID,
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
        transactions: [_generateCMTransaction(false, INVOICE_LICENCE_1_TRANSACTION_ID)]
      },
      {
        id: randomUUID({ disableEntropyCache: true }),
        licenceNumber: 'INVOICE_LICENCE_2',
        transactions: [_generateCMTransaction(false, INVOICE_LICENCE_2_TRANSACTION_ID)]
      }
    ]
  }
}

describe('Reissue invoice service', () => {
  let reissueBillingBatch
  let sourceInvoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    reissueBillingBatch = { externalId: randomUUID({ disableEntropyCache: true }) }

    Sinon.stub(ChargingModuleReissueInvoiceService, 'go')
      .withArgs(reissueBillingBatch.externalId, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE }
      })

    Sinon.stub(ChargingModuleViewInvoiceService, 'go')
      .withArgs(reissueBillingBatch.externalId, CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE.invoice.id)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE }
      })
      .withArgs(reissueBillingBatch.externalId, CHARGING_MODULE_VIEW_INVOICE_REISSUE_RESPONSE.invoice.id)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_VIEW_INVOICE_REISSUE_RESPONSE }
      })

    Sinon.stub(ChargingModuleBillRunStatusService, 'go').resolves({
      succeeded: true,
      response: {
        body: {
          status: 'initialised'
        }
      }
    })

    sourceInvoice = await BillingInvoiceHelper.add({
      externalId: INVOICE_EXTERNAL_ID,
      isFlaggedForRebilling: true
    })

    const sourceInvoiceLicences = await Promise.all([
      BillingInvoiceLicenceHelper.add({
        billingInvoiceId: sourceInvoice.billingInvoiceId,
        licenceId: randomUUID({ disableEntropyCache: true }),
        licenceRef: 'INVOICE_LICENCE_1'
      }),
      BillingInvoiceLicenceHelper.add({
        billingInvoiceId: sourceInvoice.billingInvoiceId,
        licenceId: randomUUID({ disableEntropyCache: true }),
        licenceRef: 'INVOICE_LICENCE_2'
      })
    ])

    await BillingTransactionHelper.add({
      billingInvoiceLicenceId: sourceInvoiceLicences[0].billingInvoiceLicenceId,
      externalId: INVOICE_LICENCE_1_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    await BillingTransactionHelper.add({
      billingInvoiceLicenceId: sourceInvoiceLicences[1].billingInvoiceLicenceId,
      externalId: INVOICE_LICENCE_2_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    // Refresh sourceInvoice to include billing invoice licences and transactions, as expected by the service
    sourceInvoice = await sourceInvoice.$query().withGraphFetched('billingInvoiceLicences.billingTransactions')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('returns two billing invoices per source invoice (one cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

      expect(result.billingInvoices).to.have.length(2)
    })

    it('returns two billing invoice licences per source invoice licence (one cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

      expect(result.billingInvoiceLicences).to.have.length(4)
    })

    it('persists two transactions per source transaction (one cancelling, one reissuing)', async () => {
      const result = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

      expect(result.billingTransactions).to.have.length(4)
    })

    it('sets the source invoice rebilling state to `rebilled`', async () => {
      await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

      expect(sourceInvoice.rebillingState).to.equal('rebilled')
    })

    describe('sets the original billing invoice id', () => {
      it('to its own id if `null`', async () => {
        await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

        expect(sourceInvoice.originalBillingInvoiceId).to.equal(sourceInvoice.billingInvoiceId)
      })

      it("to the existing value if it's populated", async () => {
        const ORIGINAL_BILLING_INVOICE_ID = randomUUID({ disableEntropyCache: true })
        await sourceInvoice.$query().patch({ originalBillingInvoiceId: ORIGINAL_BILLING_INVOICE_ID })

        await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

        expect(sourceInvoice.originalBillingInvoiceId).to.equal(ORIGINAL_BILLING_INVOICE_ID)
      })
    })

    describe('sets the transaction net amount to the charge value returned by the CM', () => {
      it('negative for credits', async () => {
        const result = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

        const credits = result.billingTransactions.filter(transaction => transaction.isCredit)

        credits.forEach((transaction) => {
          expect(transaction.netAmount).to.be.below(0)
        })
      })

      it('positive for debits', async () => {
        const result = await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

        const debits = result.billingTransactions.filter(transaction => !transaction.isCredit)

        debits.forEach((transaction) => {
          expect(transaction.netAmount).to.be.above(0)
        })
      })
    })

    describe("and the Charging Module's bill run status is `pending`", () => {
      let billRunStatusStub

      beforeEach(() => {
        ChargingModuleBillRunStatusService.go.restore()

        billRunStatusStub = Sinon
          .stub(ChargingModuleBillRunStatusService, 'go')
          .onFirstCall().resolves({
            succeeded: true, response: { body: { status: 'pending' } }
          })
          .onSecondCall().resolves({
            succeeded: true, response: { body: { status: 'initialised' } }
          })
      })

      it("retries until it's no longer `pending`", async () => {
        await ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)

        expect(billRunStatusStub.callCount).to.equal(2)
      })
    })
  })

  describe('and the Charging Module returns an error', () => {
    describe('when sending the reissue request', () => {
      beforeEach(() => {
        ChargingModuleReissueInvoiceService.go.restore()
        Sinon.stub(ChargingModuleReissueInvoiceService, 'go').resolves({
          succeeded: false, response: { body: 'RESPONSE_BODY' }
        })
      })

      it('throws an error', async () => {
        await expect(ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch))
          .to.reject(Error, 'Charging Module reissue request failed')
      })

      it('includes the billing batch and source invoice external ids and CM response body', async () => {
        const errorResult = await expect(ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)).to.reject()

        expect(errorResult.billingBatchExternalId).to.equal(reissueBillingBatch.externalId)
        expect(errorResult.invoiceExternalId).to.equal(sourceInvoice.externalId)
        expect(errorResult.responseBody).to.equal('RESPONSE_BODY')
      })
    })

    describe('when viewing an invoice', () => {
      beforeEach(() => {
        ChargingModuleViewInvoiceService.go.restore()
        Sinon.stub(ChargingModuleViewInvoiceService, 'go').resolves({
          succeeded: false, response: { body: 'RESPONSE_BODY' }
        })
      })

      it('throws an error', async () => {
        await expect(ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch))
          .to.reject(Error, 'Charging Module view invoice request failed')
      })

      it('includes the billing batch and reissue invoice external ids and CM response body', async () => {
        const errorResult = await expect(ReissueInvoiceService.go(sourceInvoice, reissueBillingBatch)).to.reject()

        expect(errorResult.billingBatchExternalId).to.equal(reissueBillingBatch.externalId)
        // The error will be thrown on the first iteration over the invoices so we hardcode the check for the first
        // element's id
        expect(errorResult.reissueInvoiceExternalId).to.equal(CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id)
        expect(errorResult.responseBody).to.equal('RESPONSE_BODY')
      })
    })
  })
})

function _generateCMTransaction (credit, rebilledTransactionId) {
  return {
    id: randomUUID({ disableEntropyCache: true }),
    chargeValue: 1000,
    credit,
    rebilledTransactionId
  }
}
