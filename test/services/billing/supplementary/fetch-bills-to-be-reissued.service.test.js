'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/water/bill-licence.helper.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')
const BillRunHelper = require('../../../support/helpers/water/bill-run.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

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
    await BillingTransactionHelper.add({ billingInvoiceLicenceId })
  })

  describe('when there are no bills to be reissued', () => {
    it('returns no results', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).to.be.empty()
    })
  })

  describe('when there are bills to be reissued', () => {
    beforeEach(async () => {
      await bill.$query().patch({ isFlaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).to.have.length(1)
      expect(result[0]).to.be.an.instanceOf(BillModel)
    })

    it('returns only the required bill fields', async () => {
      const bill = await FetchBillsToBeReissuedService.go(billRun.regionId)

      const result = Object.keys(bill[0])

      expect(result).to.only.include([
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

      expect(result).to.only.include([
        'licenceRef',
        'licenceId',
        'billingTransactions'
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
        await BillingTransactionHelper.add({ billingInvoiceLicenceId: alcsBillingInvoiceLicenceId })
      })

      it('returns only sroc bills', async () => {
        const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

        expect(result).to.have.length(1)
        expect(result[0].billingInvoiceId).to.equal(bill.billingInvoiceId)
      })
    })
  })

  describe('when fetching from the db fails', () => {
    let notifierStub

    beforeEach(() => {
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      delete global.GlobalNotifier
      Sinon.restore()
    })

    it('logs an error', async () => {
      // Force an error by calling the service with an invalid uuid
      await FetchBillsToBeReissuedService.go('NOT_A_UUID')

      expect(notifierStub.omfg.calledWith('Could not fetch reissue bills')).to.be.true()
    })

    it('returns an empty array', async () => {
      const result = await FetchBillsToBeReissuedService.go(billRun.regionId)

      expect(result).to.be.empty()
    })
  })
})
