'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, after } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')

// Things we need to stub
const ChargingModuleReissueBillRequest = require('../../../../app/requests/charging-module/reissue-bill.request.js')
const ChargingModuleViewBillRequest = require('../../../../app/requests/charging-module/view-bill.request.js')
const ChargingModuleViewBillRunStatusRequest = require('../../../../app/requests/charging-module/view-bill-run-status.request.js')
const { closeConnection } = require('../../../support/database.js')

// Thing under test
const ReissueBillService = require('../../../../app/services/bill-runs/reissue/reissue-bill.service.js')

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
    reissueBillRun = { externalId: generateUUID() }

    Sinon.stub(ChargingModuleReissueBillRequest, 'send')
      .withArgs(reissueBillRun.externalId, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: { body: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE }
      })

    Sinon.stub(ChargingModuleViewBillRequest, 'send')
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

    Sinon.stub(ChargingModuleViewBillRunStatusRequest, 'send').resolves({
      succeeded: true,
      response: {
        body: {
          status: 'initialised'
        }
      }
    })

    sourceBill = await BillHelper.add({
      externalId: INVOICE_EXTERNAL_ID,
      flaggedForRebilling: true
    })

    const sourceBillLicences = await Promise.all([
      BillLicenceHelper.add({
        billId: sourceBill.id,
        licenceId: generateUUID(),
        licenceRef: 'INVOICE_LICENCE_1'
      }),
      BillLicenceHelper.add({
        billId: sourceBill.id,
        licenceId: generateUUID(),
        licenceRef: 'INVOICE_LICENCE_2'
      })
    ])

    await TransactionHelper.add({
      billLicenceId: sourceBillLicences[0].id,
      externalId: INVOICE_LICENCE_1_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    await TransactionHelper.add({
      billLicenceId: sourceBillLicences[1].id,
      externalId: INVOICE_LICENCE_2_TRANSACTION_ID,
      purposes: { test: 'TEST' }
    })

    // Refresh sourceBill to include bill licences and transactions, as expected by the service
    sourceBill = await sourceBill.$query().withGraphFetched('billLicences.transactions')
  })

  afterEach(async () => {
    await sourceBill.$query().delete()

    Sinon.restore()
  })

  after(async () => {
    await closeConnection()
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

        expect(sourceBill.originalBillId).to.equal(sourceBill.id)
      })

      it("to the existing value if it's populated", async () => {
        const originalBillId = generateUUID()

        await sourceBill.$query().patch({ originalBillId })

        await ReissueBillService.go(sourceBill, reissueBillRun)

        expect(sourceBill.originalBillId).to.equal(originalBillId)
      })
    })

    describe('sets the transaction net amount to the charge value returned by the CM', () => {
      it('negative for credits', async () => {
        const result = await ReissueBillService.go(sourceBill, reissueBillRun)

        const credits = result.transactions.filter((transaction) => {
          return transaction.credit
        })

        credits.forEach((transaction) => {
          expect(transaction.netAmount).to.be.below(0)
        })
      })

      it('positive for debits', async () => {
        const result = await ReissueBillService.go(sourceBill, reissueBillRun)

        const debits = result.transactions.filter((transaction) => {
          return !transaction.credit
        })

        debits.forEach((transaction) => {
          expect(transaction.netAmount).to.be.above(0)
        })
      })
    })

    describe('and the Charging Modules bill run status is "pending"', () => {
      let billRunStatusStub

      beforeEach(() => {
        ChargingModuleViewBillRunStatusRequest.send.restore()

        billRunStatusStub = Sinon.stub(ChargingModuleViewBillRunStatusRequest, 'send')
          .onFirstCall()
          .resolves({
            succeeded: true,
            response: { body: { status: 'pending' } }
          })
          .onSecondCall()
          .resolves({
            succeeded: true,
            response: { body: { status: 'initialised' } }
          })
      })

      it('retries until it is no longer "pending"', async () => {
        await ReissueBillService.go(sourceBill, reissueBillRun)

        expect(billRunStatusStub.callCount).to.equal(2)
      })
    })
  })

  describe('and the Charging Module returns an error', () => {
    describe('when sending the reissue request', () => {
      beforeEach(() => {
        ChargingModuleReissueBillRequest.send.restore()
        Sinon.stub(ChargingModuleReissueBillRequest, 'send').resolves({
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
        await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject(
          Error,
          'Charging Module reissue request failed'
        )
      })

      it('includes the bill run and source bill external ids', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.billRunExternalId).to.equal(reissueBillRun.externalId)
        expect(errorResult.billExternalId).to.equal(sourceBill.externalId)
      })

      it('includes the Charging Module response body', async () => {
        const errorResult = await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject()

        expect(errorResult.responseBody.error).to.equal('Conflict')
        expect(errorResult.responseBody.message).to.equal(
          'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.'
        )
        expect(errorResult.responseBody.statusCode).to.equal(409)
      })
    })

    describe('when viewing a bill', () => {
      beforeEach(() => {
        ChargingModuleViewBillRequest.send.restore()
        Sinon.stub(ChargingModuleViewBillRequest, 'send').resolves({
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
        await expect(ReissueBillService.go(sourceBill, reissueBillRun)).to.reject(
          Error,
          'Charging Module view bill request failed'
        )
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
        expect(errorResult.responseBody.message).to.equal(
          'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.'
        )
        expect(errorResult.responseBody.statusCode).to.equal(409)
      })
    })
  })
})

function _generateCMTransaction(credit, rebilledTransactionId) {
  return {
    id: generateUUID(),
    chargeValue: 1000,
    credit,
    rebilledTransactionId
  }
}
