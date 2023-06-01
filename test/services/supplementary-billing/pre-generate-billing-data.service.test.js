'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const FetchInvoiceAccountNumbersService = require('../../../app/services/supplementary-billing/fetch-invoice-account-numbers.service.js')

// Thing under test
const PreGenerateBillingDataService = require('../../../app/services/supplementary-billing/pre-generate-billing-data.service.js')

describe('Pre-generate billing data service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  const billingBatchId = '027b69aa-b0f7-46d0-86ce-ab577932fc5b'

  const invoiceAccounts = [
    {
      invoiceAccountId: '235bae72-01f7-4a21-b8a3-d2b5fb2eff91',
      invoiceAccountNumber: 'T12345678A'
    },
    {
      invoiceAccountId: '1d407b9c-457a-487d-bfe1-a54b72ef0bb5',
      invoiceAccountNumber: 'T87654321A'
    }
  ]

  const licences = [
    { licenceId: 'caf6d22b-f235-4f82-9867-b98c884432b6', licenceRef: 'AT/CURR/MONTHLY/01' },
    { licenceId: 'e35636a1-9115-4e69-830d-48eb80738838', licenceRef: 'AT/CURR/MONTHLY/02' }
  ]

  let chargeVersions

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(async () => {
      chargeVersions = [
        { invoiceAccountId: invoiceAccounts[0].invoiceAccountId, licence: licences[0] },
        { invoiceAccountId: invoiceAccounts[1].invoiceAccountId, licence: licences[0] },
        { invoiceAccountId: invoiceAccounts[1].invoiceAccountId, licence: licences[1] },
        { invoiceAccountId: invoiceAccounts[1].invoiceAccountId, licence: licences[1] }
      ]

      Sinon.stub(FetchInvoiceAccountNumbersService, 'go').resolves(invoiceAccounts)
    })

    describe('returns an object with a billingInvoices property', () => {
      it('has one key per invoice account', async () => {
        const { billingInvoices: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const keys = Object.keys(result)
        expect(keys).to.have.length(2)
      })

      it('is keyed with the invoice account id', async () => {
        const { billingInvoices: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).to.equal(value.invoiceAccountId)
        })
      })

      it('has the correct data for each key', async () => {
        const { billingInvoices: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingInvoiceAccount = invoiceAccounts.find((invoiceAccount) => {
            return key === invoiceAccount.invoiceAccountId
          })
          expect(value.invoiceAccountNumber).to.equal(matchingInvoiceAccount.invoiceAccountNumber)
        })
      })
    })

    describe('returns an object with a billingInvoiceLicences property', () => {
      it('has one key per combination of billing invoice id and licence id', async () => {
        const { billingInvoiceLicences: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const keys = Object.entries(result)
        expect(keys).to.have.length(3)
      })

      it('is keyed with the billing invoice id and licence id', async () => {
        const { billingInvoiceLicences: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          expect(key).to.equal(`${value.billingInvoiceId}-${value.licenceId}`)
        })
      })

      it('has the correct data for each key', async () => {
        const { billingInvoiceLicences: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatchId, billingPeriod)

        const entries = Object.entries(result)

        entries.forEach(([key, value]) => {
          const matchingLicence = licences.find((licence) => {
            return key === `${value.billingInvoiceId}-${licence.licenceId}`
          })
          expect(value.licenceRef).to.equal(matchingLicence.licenceRef)
        })
      })
    })
  })
})
