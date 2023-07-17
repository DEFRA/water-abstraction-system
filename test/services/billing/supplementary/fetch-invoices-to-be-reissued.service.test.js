'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const BillingBatchHelper = require('../../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceModel = require('../../../../app/models/water/billing-invoice.model.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')

// Thing under test
const FetchInvoicesToBeReissuedService = require('../../../../app/services/billing/supplementary/fetch-invoices-to-be-reissued.service.js')

describe('Fetch Invoices To Be Reissued service', () => {
  let billingBatch
  let billingInvoice

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingBatch = await BillingBatchHelper.add()
    billingInvoice = await BillingInvoiceHelper.add({ billingBatchId: billingBatch.billingBatchId })
    const { billingInvoiceLicenceId } = await BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoice.billingInvoiceId })
    await BillingTransactionHelper.add({ billingInvoiceLicenceId })
  })

  describe('when there are no billing invoices to be reissued', () => {
    it('returns no results', async () => {
      const result = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      expect(result).to.be.empty()
    })
  })

  describe('when there are billing invoices to be reissued', () => {
    beforeEach(async () => {
      await billingInvoice.$query().patch({ isFlaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      expect(result).to.have.length(1)
      expect(result[0]).to.be.an.instanceOf(BillingInvoiceModel)
    })

    it('returns only the required billing invoice fields', async () => {
      const billingInvoice = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      const result = Object.keys(billingInvoice[0])

      expect(result).to.only.include([
        'billingInvoiceId',
        'externalId',
        'financialYearEnding',
        'invoiceAccountId',
        'invoiceAccountNumber',
        'billingInvoiceLicences',
        'originalBillingInvoiceId'
      ])
    })

    it('returns only the required billing invoice licence fields', async () => {
      const billingInvoice = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      const { billingInvoiceLicences } = billingInvoice[0]

      const result = Object.keys(billingInvoiceLicences[0])

      expect(result).to.only.include([
        'licenceRef',
        'licenceId',
        'billingTransactions'
      ])
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
      await FetchInvoicesToBeReissuedService.go('NOT_A_UUID')

      expect(notifierStub.omfg.calledWith('Could not fetch reissue invoices')).to.be.true()
    })

    it('returns an empty array', async () => {
      const result = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      expect(result).to.be.empty()
    })
  })
})
