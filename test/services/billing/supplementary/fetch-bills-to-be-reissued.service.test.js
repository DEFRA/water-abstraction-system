'use strict'

// Test framework dependencies
const { describe, it, beforeEach, afterEach, expect } = require('@jest/globals')
const sinon = require('sinon')

// Test helpers
const BillHelper = require('../../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/water/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/water/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const TransactionHelper = require('../../../support/helpers/water/transaction.helper.js')

// Thing under test
const FetchBillsToBeReissuedService = require('../../../../app/services/billing/supplementary/fetch-bills-to-be-reissued.service.js')

describe('Fetch Bills To Be Reissued service', () => {
  let billRun
  let bill

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billRun = await BillRunHelper.add()
    bill = await BillHelper.add({ billingBatchId: billRun.billingBatchId })
    const { billingInvoiceLicenceId } = await BillLicenceHelper.add({ billingInvoiceId: bill.billingInvoiceId })
    await TransactionHelper.add({ billingInvoiceLicenceId })
  })

  describe('when there are no bills to be reissued', () => {
    it('returns no results', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).toEqual([])
    })
  })

  describe('when there are bills to be reissued', () => {
    beforeEach(async () => {
      await bill.$query().patch({ isFlaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(BillModel)
    })

    it('returns only the required bill fields', async () => {
      const bill = await FetchBillsToBeReissuedService.go(billRun.regionId)

      const result = Object.keys(bill[0])

      expect(result).toEqual([
        'billingInvoiceId',
        'externalId',
        'financialYearEnding',
        'invoiceAccountId',
        'invoiceAccountNumber',
        'billLicences',
        'originalBillingInvoiceId'
      ])
    })

    it('returns only the required bill licence fields', async () => {
      const bill = await FetchBillsToBeReissuedService.go(billRun.regionId)

      const { billLicences } = bill[0]

      const result = Object.keys(billLicences[0])

      expect(result).toEqual([
        'licenceRef',
        'licenceId',
        'transactions'
      ])
    })

    describe('and there are alcs bills to be reissued', () => {
      beforeEach(async () => {
        const alcsBillRun = await BillRunHelper.add({ scheme: 'alcs' })
        const alcsBill = await BillHelper.add({
          billingBatchId: alcsBillRun.billingBatchId,
          isFlaggedForRebilling: true
        })
        const { billingInvoiceLicenceId: alcsBillingInvoiceLicenceId } = await BillLicenceHelper.add({
          billingInvoiceId: alcsBill.billingInvoiceId
        })
        await TransactionHelper.add({ billingInvoiceLicenceId: alcsBillingInvoiceLicenceId })
      })

      it('returns only sroc bills', async () => {
        const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

        expect(result).toHaveLength(1)
        expect(result[0].billingInvoiceId).toEqual(bill.billingInvoiceId)
      })
    })
  })

  describe('when fetching from the db fails', () => {
    let notifierStub

    beforeEach(() => {
      notifierStub = { omg: sinon.stub(), omfg: sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      delete global.GlobalNotifier
      sinon.restore()
    })

    it('logs an error', async () => {
      // Force an error by calling the service with an invalid uuid
      await FetchBillsToBeReissuedService.go('NOT_A_UUID')

      expect(notifierStub.omfg.calledWith('Could not fetch reissue bills')).toBeTruthy()
    })

    it('returns an empty array', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).toEqual([])
    })
  })
})
