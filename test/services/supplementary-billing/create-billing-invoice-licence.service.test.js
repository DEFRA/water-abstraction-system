'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceModel = require('../../../app/models/water/billing-invoice-licence.model.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const CreateBillingInvoiceLicenceService = require('../../../app/services/supplementary-billing/create-billing-invoice-licence.service.js')

describe('Create Billing Invoice Licence service', () => {
  let billingInvoice
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingInvoice = await BillingBatchHelper.add()
    licence = await LicenceHelper.add()
  })

  describe('when no existing billing invoice licence exists', () => {
    it('returns the new billing invoice licence instance', async () => {
      const result = await CreateBillingInvoiceLicenceService.go(billingInvoice, licence)

      expect(result).to.be.an.instanceOf(BillingInvoiceLicenceModel)

      expect(result.billingInvoiceId).to.equal(billingInvoice.billingInvoiceId)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.licenceId).to.equal(licence.licenceId)
    })
  })

  describe('when an existing billing invoice licence exists', () => {
    it('returns an existing billing invoice licence instance containing the correct data', async () => {
      const result1 = await CreateBillingInvoiceLicenceService.go(billingInvoice, licence)
      const result2 = await CreateBillingInvoiceLicenceService.go(billingInvoice, licence)

      expect(result1.billingInvoiceLicenceId).to.equal(result2.billingInvoiceLicenceId)
    })
  })
})
