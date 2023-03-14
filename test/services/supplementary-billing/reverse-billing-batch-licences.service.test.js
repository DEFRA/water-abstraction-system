'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Thing under test
const ReverseBillingBatchLicencesService = require('../../../app/services/supplementary-billing/reverse-billing-batch-licences.service.js')

describe.only('Reverse Billing Batch Licences service', () => {
  let billingBatch
  let licence
  let billingTransaction

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    licence = await LicenceHelper.add({ includeInSupplementaryBilling: 'yes', regionId })
    const { changeReasonId } = await ChangeReasonHelper.add()
    const { invoiceAccountId } = await InvoiceAccountHelper.add()
    const { chargeVersionId } = await ChargeVersionHelper.add({ changeReasonId, invoiceAccountId }, licence)
    const { billingChargeCategoryId } = await BillingChargeCategoryHelper.add()
    const { chargeElementId } = await ChargeElementHelper.add({ billingChargeCategoryId, chargeVersionId })
    await ChargePurposeHelper.add({ chargeElementId })

    billingBatch = await BillingBatchHelper.add({ regionId })

    const billingInvoice = await BillingInvoiceHelper.add({}, billingBatch)
    const billingInvoiceLicence = await BillingInvoiceLicenceHelper.add({}, licence, billingInvoice)
    billingTransaction = await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicence.billingInvoiceLicenceId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('returns the transactions for the given licence', async () => {
      const result = await ReverseBillingBatchLicencesService.go(billingBatch, [licence])

      expect(result).to.equal([billingTransaction])
    })
  })
})
