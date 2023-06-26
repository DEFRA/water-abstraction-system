'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceModel = require('../../../app/models/water/billing-invoice.model.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')

// Thing under test
const FetchInvoicesToBeReissuedService = require('../../../app/services/supplementary-billing/fetch-invoices-to-be-reissued.service.js')

describe.only('Fetch Invoices To Be Reissued service', () => {
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

  describe.only('when there are billing invoices to be reissued', () => {
    beforeEach(async () => {
      await billingInvoice.$query().patch({ isFlaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)
      console.log('🚀 ~ file: fetch-invoices-to-be-reissued.service.test.js:53 ~ it ~ result:', result)

      expect(result).to.have.length(1)
      expect(result[0]).to.be.an.instanceOf(BillingInvoiceModel)
    })

    it('returns only the required billing invoice fields', async () => {
      const billingInvoice = await FetchInvoicesToBeReissuedService.go(billingBatch.regionId)

      const result = Object.keys(billingInvoice[0])

      expect(result).to.only.include([
        'externalId',
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
})
