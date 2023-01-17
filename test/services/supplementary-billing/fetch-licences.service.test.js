'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')

// Thing under test
const FetchLicencesService = require('../../../app/services/supplementary-billing/fetch-licences.service.js')

describe.only('Fetch Licences service', () => {
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

      describe('and that have an SROC charge version. Licence not previosly billed', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].billingInvoiceLicences).to.equal([])
        })
      })

      describe('and that have an SROC charge version. Licence previosly billed in current period 2023', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
          billingInvoice = await BillingInvoiceHelper.add({ financialYearEnding: billingPeriodFinancialYearEnding })
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].billingInvoiceLicences[0].billingInvoice.financialYearEnding).to.equal(billingPeriodFinancialYearEnding)
        })
      })

      describe('and that have an SROC charge version. Licence previosly billed in previous period 2022', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
          billingInvoice = await BillingInvoiceHelper.add({ financialYearEnding: 2022 })
          await BillingInvoiceLicenceHelper.add({}, testLicence, billingInvoice)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
          expect(result[0].billingInvoiceLicences[0].billingInvoice).to.equal(null)
        })
      })

      describe('and that have multiple SROC charge versions', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
          await ChargeVersionHelper.add({}, testLicence)
        })

        it('returns a licence only once in the results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
        })
      })

      describe('but do not have an SROC charge version', () => {
        it('returns no results', async () => {
          const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

          expect(result.length).to.equal(0)
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
      await LicenceHelper.add({ regionId: '000446bd-182a-4340-be6b-d719855ace1a' })
    })

    it('returns no results', async () => {
      const result = await FetchLicencesService.go(region, billingPeriodFinancialYearEnding)

      expect(result.length).to.equal(0)
    })
  })
})
