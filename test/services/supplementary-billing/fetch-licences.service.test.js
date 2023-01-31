'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/supplementary-billing/fetch-licences.service.js')

describe('Fetch Licences service', () => {
  const region = { regionId: LicenceHelper.defaults().regionId }
  const billingPeriodFinancialYearEnding = 2023
  let testLicence
  let billingInvoice

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are licences for the matching region', () => {
    describe('that are flagged to be included in supplementary billing', () => {
      beforeEach(async () => {
        testLicence = await LicenceHelper.add({ includeInSupplementaryBilling: 'yes' })
      })

      describe('and that have not been previously billed', () => {
        it('returns the expected results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(0)
        })
      })

      describe('and that have been billed in the current period', () => {
        beforeEach(async () => {
          billingInvoice = await BillingInvoiceHelper.add(
            { financialYearEnding: billingPeriodFinancialYearEnding },
            { status: 'sent' }
          )
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns the expected results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(1)
        })
      })

      describe("and that are included in an 'unsent' billing batch in the current period", () => {
        beforeEach(async () => {
          billingInvoice = await BillingInvoiceHelper.add({ financialYearEnding: billingPeriodFinancialYearEnding })
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(0)
        })
      })

      describe('and that have been billed in the previous period', () => {
        beforeEach(async () => {
          billingInvoice = await BillingInvoiceHelper.add(
            { financialYearEnding: 2022 },
            { status: 'sent' }
          )
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(0)
        })
      })

      describe('and that have been billed twice in the current period', () => {
        beforeEach(async () => {
          billingInvoice = await BillingInvoiceHelper.add(
            { financialYearEnding: billingPeriodFinancialYearEnding },
            { status: 'sent' }
          )
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
          billingInvoice = await BillingInvoiceHelper.add(
            { financialYearEnding: billingPeriodFinancialYearEnding },
            { status: 'sent' }
          )
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns a licence only once in the results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(2)
        })
      })

      // NOTE: This situation will not occur normally. But as the billing batch is filtered on `scheme` we wanted a test to ensure the filter worked
      describe('and that have been billed in the current period under a different scheme', () => {
        beforeEach(async () => {
          billingInvoice = await BillingInvoiceHelper.add(
            { financialYearEnding: billingPeriodFinancialYearEnding },
            { status: 'sent', scheme: 'alcs' }
          )
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns no results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
          expect(result[0].numberOfTimesBilled).to.equal(0)
        })
      })
    })

    describe('that are not flagged to be included in supplementary billing', () => {
      beforeEach(async () => {
        await LicenceHelper.add()
      })

      it('returns no results', async () => {
        const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

        expect(result.length).to.equal(0)
      })
    })
  })

  describe('when there are no licences for the matching region', () => {
    beforeEach(async () => {
      await LicenceHelper.add({
        regionId: '000446bd-182a-4340-be6b-d719855ace1a',
        includeInSupplementaryBilling: 'yes'
      })
    })

    it('returns no results', async () => {
      const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

      expect(result.length).to.equal(0)
    })
  })
})
