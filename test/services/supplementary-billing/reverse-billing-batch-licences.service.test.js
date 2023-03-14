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

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    const { licenceId } = await LicenceHelper.add({ includeInSupplementaryBilling: 'yes', regionId })
    const { changeReasonId } = await ChangeReasonHelper.add()
    const { invoiceAccountId } = await InvoiceAccountHelper.add()
    const { chargeVersionId } = await ChargeVersionHelper.add({ changeReasonId, invoiceAccountId }, { licenceId })
    const { billingChargeCategoryId } = await BillingChargeCategoryHelper.add()
    const { chargeElementId } = await ChargeElementHelper.add({ billingChargeCategoryId, chargeVersionId })
    await ChargePurposeHelper.add({ chargeElementId })

    billingBatch = await BillingBatchHelper.add({ regionId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    it('returns the billing batch id', async () => {
      const result = await ReverseBillingBatchLicencesService.go(billingBatch, [])

      expect(result).to.equal(billingBatch.billingBatchId)
    })
  })
})
