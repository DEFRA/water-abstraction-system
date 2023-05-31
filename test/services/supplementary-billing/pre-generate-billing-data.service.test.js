'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const FetchInvoiceAccountNumbersService = require('../../../app/services/supplementary-billing/fetch-invoice-account-numbers.service.js')

// Thing under test
const PreGenerateBillingDataService = require('../../../app/services/supplementary-billing/pre-generate-billing-data.service.js')

describe('Pre-generate billing data service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }
  let licence
  let changeReason
  let invoiceAccount
  let billingBatch
  let chargeVersions

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    licence = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true, regionId })
    changeReason = await ChangeReasonHelper.add()
    invoiceAccount = await InvoiceAccountHelper.add()

    billingBatch = await BillingBatchHelper.add({ regionId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    beforeEach(async () => {
      await ChargeVersionHelper.add(
        {
          changeReasonId: changeReason.changeReasonId,
          invoiceAccountId: invoiceAccount.invoiceAccountId,
          startDate: new Date(2022, 7, 1, 9),
          licenceId: licence.licenceId
        }
      )

      chargeVersions = await FetchChargeVersionsService.go(licence.regionId, billingPeriod)

      Sinon.stub(FetchInvoiceAccountNumbersService, 'go').resolves(
        [{
          invoiceAccountId: chargeVersions[0].invoiceAccountId,
          invoiceAccountNumber: 'T12345678A'
        }]
      )
    })

    it('returns billingInvoices keyed with the invoice account id', async () => {
      const { billingInvoices: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatch.billingBatchId, billingPeriod)

      const entries = Object.entries(result)
      const [key, value] = entries[0]

      expect(entries).to.have.length(1)
      expect(key).to.equal(value.invoiceAccountId)
    })

    it('returns billingInvoiceLicences keyed with the billing invoice id and licence id', async () => {
      const { billingInvoiceLicences: result } = await PreGenerateBillingDataService.go(chargeVersions, billingBatch.billingBatchId, billingPeriod)

      const entries = Object.entries(result)
      const [key, value] = entries[0]

      expect(entries).to.have.length(1)
      expect(key).to.equal(`${value.billingInvoiceId}-${value.licenceId}`)
    })
  })
})
