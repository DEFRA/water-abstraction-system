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
  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when a BillingBatchModel instance is provided', () => {
    let billingInvoice
    let licence

    beforeEach(async () => {
      billingInvoice = await BillingBatchHelper.add()
      licence = await LicenceHelper.add()
    })

    it('creates an event record', async () => {
      const result = await CreateBillingInvoiceLicenceService.go(billingInvoice, licence)

      expect(result).to.be.an.instanceOf(BillingInvoiceLicenceModel)

      expect(result.billingInvoiceId).to.equal(billingInvoice.billingInvoiceId)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.licenceId).to.equal(licence.licenceId)
    })
  })
})
