'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/water/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/water/bill-licence.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/water/transaction.helper.js')

// Things we need to stub
const ChargingModuleBillRunStatusService = require('../../../../app/services/charging-module/bill-run-status.service.js')
const ChargingModuleReissueBillService = require('../../../../app/services/charging-module/reissue-bill.service.js')
const ChargingModuleViewBillService = require('../../../../app/services/charging-module/view-bill.service.js')

// Thing under test
const ReissueBillService = require('../../../../app/services/billing/supplementary/reissue-bill.service.js')

const ORIGINAL_BILLING_BATCH_EXTERNAL_ID = generateUUID()
const INVOICE_EXTERNAL_ID = generateUUID()
const INVOICE_LICENCE_1_TRANSACTION_ID = generateUUID()
const INVOICE_LICENCE_2_TRANSACTION_ID = generateUUID()

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    { id: generateUUID(), rebilledType: 'C' },
    { id: generateUUID(), rebilledType: 'R' }
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
        id: generateUUID(),
        licenceNumber: 'INVOICE_LICENCE_1',
        transactions: [_generateCMTransaction(true, INVOICE_LICENCE_1_TRANSACTION_ID)]
      },
      {
        id: generateUUID(),
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
        id: generateUUID(),
        licenceNumber: 'INVOICE_LICENCE_1',
        transactions: [_generateCMTransaction(false, INVOICE_LICENCE_1_TRANSACTION_ID)]
      },
      {
        id: generateUUID(),
        licenceNumber: 'INVOICE_LICENCE_2',
        transactions: [_generateCMTransaction(false, INVOICE_LICENCE_2_TRANSACTION_ID)]
      }
    ]
  }
}

describe('Reissue Bill service', () => {
  let reissueBillRun
  let sourceBill

  beforeEach(async () => {
    await DatabaseHelper.clean()

    reissueBillRun = { externalId: generateUUID() }

    Sinon.stub(ChargingModuleReissueBillService, 'go')
      .withArgs(reissueBillRun.externalId, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE }
      })

    Sinon.stub(ChargingModuleViewBillService, 'go')
      .withArgs(reissueBillRun.externalId, CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE.invoice.id)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE }
      })
      .withArgs(reissueBillRun.externalId, CHARGING_MODULE_VIEW_INVOICE_REISSUE_RESPONSE.invoice.id)
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

    sourceBill = await BillHelper.add({
      externalId: INVOICE_EXTERNAL_ID,
      isFlaggedForRebilling: true
    })

    const sourceBillLicences = await Promise.all([
      BillLicenceHelper.add({
        billingInvoiceId: sourceBill.billingInvoiceId,
        licenceId: generateUUID(),
        licenceRef: 'INVOICE_LICENCE_1'
      }),
      BillLicenceHelper.add({
        billingInvoiceId: sourceBill.billingInvoiceId,
        licenceId: generateUUID(),
        licenceRef: 'INVOICE_LICENCE_2'
      })
    ])

    await TransactionHelper.add({
      billingInvoiceLicenceId: sourceBillLicences[0].billingInvoiceLicenceId,
      externalId: INVOICE_LICENCE_1_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    await TransactionHelper.add({
      billingInvoiceLicenceId: sourceBillLicences[1].billingInvoiceLicenceId,
      externalId: INVOICE_LICENCE_2_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    // Refresh sourceBill to include bill licences and transactions, as expected by the service
    sourceBill = await sourceBill.$query().withGraphFetched('billLicences.transactions')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('returns two bills per source bill (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService.go(sourceBill, reissueBillRun)

      expect(result.bills).to.have.length(2)
    })

    it('returns two bill licences per source bill licence (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService.go(sourceBill, reissueBillRun)

      expect(result.billLicences).to.have.length(4)
    })

    it('persists two transactions per source transaction (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService.go(sourceBill, reissueBillRun)

      expect(result.transactions).to.have.length(4)
    })

    it('sets the source bill rebilling state to `rebilled`', async () => {
      await ReissueBillService.go(sourceBill, reissueBillRun)

      expect(sourceBill.rebillingState).to.equal('rebilled')
    })

    describe('sets the original bill id', () => {
      it('to its own id if `null`', async () => {
        await ReissueBillService.go(sourceBill, reissueBillRun)

        expect(sourceBill.originalBillingInvoiceId).to.equal(sourceBill.billingInvoiceId)
      })

      it("to the existing value if it's populated", async () => {
        const ORIGINAL_BILLING_INVOICE_ID = generateUUID()
        await sourceBill.$query().patch({ originalBillingInvoiceId: ORIGINAL_BILLING_INVOICE_ID })

        await ReissueBillService.go(sourceBill, reissueBillRun)

        expect(sourceBill.originalBillingInvoiceId).to.equal(ORIGINAL_BILLING_INVOICE_ID)
      })
    })

    describe('sets the transaction net amount to the charge value returned by the CM', () => {
      it('negative for credits', async () => {
        const result = await ReissueBillService.go(sourceBill, reissueBillRun)

        const credits = result.transactions.filter(transaction => transaction.isCredit)

        credits.forEach((transaction) => {
          expect(transaction.netAmount).to.be.below(0)
        })
      })

      it('positive for debits', async () => {
        const result = await ReissueBillService.go(sourceBill, reissueBillRun)

        const debits = result.transactions.filter(transaction => !transaction.isCredit)

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
        await ReissueBillService.go(sourceBill, reissueBillRun)

        expect(billRunStatusStub.callCount).to.equal(2)
      })
    })
  })

  describe('and the Charging Module returns an error', () => {
    describe('when sending the reissue request', () => {
      beforeEach(() => {
        ChargingModuleReissueBillService.go.restore()
        Sinon.stub(ChargingModuleReissueBillService, 'go').resolves({
          succeeded: false,
          response: {
            body: {
              error: 'Conflict',
              message: 'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.',
              statusCode: 409
            }
          }
        })
      })

      it('throws an error', async () => {
        await expect(ReissueBillService.go(sourceBill, reissueBillRun))
          .to.reject(Error, 'Charging Module reissue request failed')
      })

      it('includes the bill run and source bill external ids', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.billRunExternalId).to.equal(reissueBillRun.externalId)
        expect(errorResult.billExternalId).to.equal(sourceBill.externalId)
      })

      it('includes the Charging Module response body', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.responseBody.error).to.equal('Conflict')
        expect(errorResult.responseBody.message).to.equal('Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.')
        expect(errorResult.responseBody.statusCode).to.equal(409)
      })
    })

    describe('when viewing a bill', () => {
      beforeEach(() => {
        ChargingModuleViewBillService.go.restore()
        Sinon.stub(ChargingModuleViewBillService, 'go').resolves({
          succeeded: false,
          response: {
            body: {
              error: 'Conflict',
              message: 'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.',
              statusCode: 409
            }
          }
        })
      })

      it('throws an error', async () => {
        await expect(ReissueBillService.go(sourceBill, reissueBillRun))
          .to.reject(Error, 'Charging Module view bill request failed')
      })

      it('includes the bill run and reissue bill external ids', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.billRunExternalId).to.equal(reissueBillRun.externalId)
        // The error will be thrown on the first iteration over the invoices so we hardcode the check for the first
        // element's id
        expect(errorResult.reissueInvoiceExternalId).to.equal(CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id)
      })

      it('includes the Charging Module response body', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.responseBody.error).to.equal('Conflict')
        expect(errorResult.responseBody.message).to.equal('Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.')
        expect(errorResult.responseBody.statusCode).to.equal(409)
      })
    })
  })
})

function _generateCMTransaction (credit, rebilledTransactionId) {
  return {
    id: generateUUID(),
    chargeValue: 1000,
    credit,
    rebilledTransactionId
  }
}
