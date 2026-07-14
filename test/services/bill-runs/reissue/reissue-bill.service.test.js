// Test helpers
import http2 from 'node:http2'
import * as BillHelper from '../../../support/helpers/bill.helper.js'
import * as BillLicenceHelper from '../../../support/helpers/bill-licence.helper.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'
import * as TransactionHelper from '../../../support/helpers/transaction.helper.js'

// Things we need to stub
import * as ChargingModuleReissueBillRequest from '../../../../app/requests/charging-module/reissue-bill.request.js'
import * as ChargingModuleViewBillRequest from '../../../../app/requests/charging-module/view-bill.request.js'
import * as ChargingModuleViewBillRunStatusRequest from '../../../../app/requests/charging-module/view-bill-run-status.request.js'

// Thing under test
import ReissueBillService from '../../../../app/services/bill-runs/reissue/reissue-bill.service.js'
const { HTTP_STATUS_CONFLICT } = http2.constants

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

    vi.spyOn(ChargingModuleReissueBillRequest, 'send').mockResolvedValue({
      succeeded: true,
      response: { body: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE }
    })

    vi.spyOn(ChargingModuleViewBillRequest, 'send')
      .mockResolvedValueOnce({
        succeeded: true,
        response: { body: CHARGING_MODULE_VIEW_INVOICE_CREDIT_RESPONSE }
      })
      .mockResolvedValueOnce({
        succeeded: true,
        response: { body: CHARGING_MODULE_VIEW_INVOICE_REISSUE_RESPONSE }
      })

    vi.spyOn(ChargingModuleViewBillRunStatusRequest, 'send').mockResolvedValue({
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

    vi.restoreAllMocks()
  })

  describe('when the service is called', () => {
    it('returns two bills per source bill (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService(sourceBill, reissueBillRun)

      expect(result.bills).toHaveLength(2)
    })

    it('returns two bill licences per source bill licence (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService(sourceBill, reissueBillRun)

      expect(result.billLicences).toHaveLength(4)
    })

    it('persists two transactions per source transaction (one cancelling, one reissuing)', async () => {
      const result = await ReissueBillService(sourceBill, reissueBillRun)

      expect(result.transactions).toHaveLength(4)
    })

    it('sets the source bill rebilling state to `rebilled`', async () => {
      await ReissueBillService(sourceBill, reissueBillRun)

      expect(sourceBill.rebillingState).toEqual('rebilled')
    })

    describe('sets the original bill id', () => {
      it('to its own id if `null`', async () => {
        await ReissueBillService(sourceBill, reissueBillRun)

        expect(sourceBill.originalBillId).toEqual(sourceBill.id)
      })

      it("to the existing value if it's populated", async () => {
        const originalBillId = generateUUID()

        await sourceBill.$query().patch({ originalBillId })

        await ReissueBillService(sourceBill, reissueBillRun)

        expect(sourceBill.originalBillId).toEqual(originalBillId)
      })
    })

    describe('sets the transaction net amount to the charge value returned by the CM', () => {
      it('negative for credits', async () => {
        const result = await ReissueBillService(sourceBill, reissueBillRun)

        const credits = result.transactions.filter((transaction) => {
          return transaction.credit
        })

        credits.forEach((transaction) => {
          expect(transaction.netAmount).toBeLessThan(0)
        })
      })

      it('positive for debits', async () => {
        const result = await ReissueBillService(sourceBill, reissueBillRun)

        const debits = result.transactions.filter((transaction) => {
          return !transaction.credit
        })

        debits.forEach((transaction) => {
          expect(transaction.netAmount).toBeGreaterThan(0)
        })
      })
    })

    describe('and the Charging Modules bill run status is "pending"', () => {
      let billRunStatusStub

      beforeEach(() => {
        billRunStatusStub = vi
          .spyOn(ChargingModuleViewBillRunStatusRequest, 'send')

          .mockResolvedValueOnce({
            succeeded: true,
            response: { body: { status: 'pending' } }
          })

          .mockResolvedValueOnce({
            succeeded: true,
            response: { body: { status: 'initialised' } }
          })
      })

      it('retries until it is no longer "pending"', async () => {
        await ReissueBillService(sourceBill, reissueBillRun)

        expect(billRunStatusStub).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('and the Charging Module returns an error', () => {
    describe('when sending the reissue request', () => {
      beforeEach(() => {
        vi.spyOn(ChargingModuleReissueBillRequest, 'send').mockResolvedValue({
          succeeded: false,
          response: {
            body: {
              error: 'Conflict',
              message: 'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.',
              statusCode: HTTP_STATUS_CONFLICT
            }
          }
        })
      })

      it('throws an error', async () => {
        await expect(ReissueBillService(sourceBill, reissueBillRun)).rejects.toThrow(
          'Charging Module reissue request failed'
        )
      })

      it('includes the bill run and source bill external ids', async () => {
        const errorResult = await ReissueBillService(sourceBill, reissueBillRun).catch((e) => {
          return e
        })

        expect(errorResult.billRunExternalId).toEqual(reissueBillRun.externalId)
        expect(errorResult.billExternalId).toEqual(sourceBill.externalId)
      })

      it('includes the Charging Module response body', async () => {
        const errorResult = await ReissueBillService(sourceBill, reissueBillRun).catch((e) => {
          return e
        })

        expect(errorResult.responseBody.error).toEqual('Conflict')
        expect(errorResult.responseBody.message).toEqual(
          'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.'
        )
        expect(errorResult.responseBody.statusCode).toEqual(HTTP_STATUS_CONFLICT)
      })
    })

    describe('when viewing a bill', () => {
      beforeEach(() => {
        vi.spyOn(ChargingModuleViewBillRequest, 'send')
          .mockReset()
          .mockResolvedValue({
            succeeded: false,
            response: {
              body: {
                error: 'Conflict',
                message: 'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.',
                statusCode: HTTP_STATUS_CONFLICT
              }
            }
          })
      })

      it('throws an error', async () => {
        await expect(ReissueBillService(sourceBill, reissueBillRun)).rejects.toThrow(
          'Charging Module view bill request failed'
        )
      })

      it('includes the bill run and reissue bill external ids', async () => {
        const errorResult = await ReissueBillService(sourceBill, reissueBillRun).catch((e) => {
          return e
        })

        expect(errorResult.billRunExternalId).toEqual(reissueBillRun.externalId)
        // The error will be thrown on the first iteration over the invoices so we hardcode the check for the first
        // element's id
        expect(errorResult.reissueInvoiceExternalId).toEqual(CHARGING_MODULE_REISSUE_INVOICE_RESPONSE.invoices[0].id)
      })

      it('includes the Charging Module response body', async () => {
        const errorResult = await ReissueBillService(sourceBill, reissueBillRun).catch((e) => {
          return e
        })

        expect(errorResult.responseBody.error).toEqual('Conflict')
        expect(errorResult.responseBody.message).toEqual(
          'Invoice 2274cd48-2a61-4b73-a9c0-bc5696c5218d has already been rebilled.'
        )
        expect(errorResult.responseBody.statusCode).toEqual(HTTP_STATUS_CONFLICT)
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
