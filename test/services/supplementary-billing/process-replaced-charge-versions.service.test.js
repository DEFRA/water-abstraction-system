'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingBatchModel = require('../../../app/models/water/billing-batch.model.js')
const BillingChargeCategoryHelper = require('../../support/helpers/water/billing-charge-category.helper.js')
const ChangeReasonHelper = require('../../support/helpers/water/change-reason.helper.js')
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargePurposeHelper = require('../../support/helpers/water/charge-purpose.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const InvoiceAccountHelper = require('../../support/helpers/crm-v2/invoice-account.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceModel = require('../../../app/models/water/licence.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')

// Things we need to stub
const ChargingModuleCreateTransactionService = require('../../../app/services/charging-module/create-transaction.service.js')
const ChargingModuleGenerateService = require('../../../app/services/charging-module/generate-bill-run.service.js')
const FetchReplacedChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-replaced-charge-versions.service.js')
const GenerateBillingTransactionsService = require('../../../app/services/supplementary-billing/generate-billing-transactions.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')

// Thing under test
const ProcessReplacedChargeVersionsService = require('../../../app/services/supplementary-billing/process-replaced-charge-versions.service.js')

describe.only('Process replacde charged versions service', () => {
  const billingPeriod = {
    startDate: new Date('2022-04-01'),
    endDate: new Date('2023-03-31')
  }

  let licence
  let changeReason
  let invoiceAccount
  let billingChargeCategory
  let billingBatch

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const { regionId } = await RegionHelper.add()
    licence = await LicenceHelper.add({ includeInSrocSupplementaryBilling: true, regionId })
    changeReason = await ChangeReasonHelper.add()
    invoiceAccount = await InvoiceAccountHelper.add()
    billingChargeCategory = await BillingChargeCategoryHelper.add()

    billingBatch = await BillingBatchHelper.add({ regionId })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the service is called', () => {
    describe.only('and there are no replaced charge versions to process', () => {
      beforeEach(() => {
        Sinon.stub(FetchReplacedChargeVersionsService, 'go').resolves([])
      })

      it('returns `true`', async () => {
        const result = await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        expect(result).to.be.true()
      })
    })

    describe('and there are replaced charge versions to process', () => {
      beforeEach(async () => {
        const region = await RegionHelper.add()
        const regionId = region.regionId

        // This creates an SROC charge version linked to a licence marked for supplementary billing
        const srocChargeVersion = await ChargeVersionHelper.add(
          {},
          { regionId, includeInSrocSupplementaryBilling: true }
        )

        // This creates an SROC charge version linked to a licence marked for supplementary billing
        // with a status of 'superseded'
        const srocSupersededChargeVersion = await ChargeVersionHelper.add(
          { status: 'superseded', invoiceAccountId: '7a1ec64d-2ab2-4cbc-8101-47f2afa4e6ad' },
          { regionId, isWaterUndertaker: true, includeInSrocSupplementaryBilling: true }
        )
      })

      it.only('does some stuff', async () => {
        await ProcessReplacedChargeVersionsService.go(billingBatch, billingPeriod)

        const result = await BillingBatchModel.query().findById(billingBatch.billingBatchId)
        console.log('🚀 ~ file: process-replaced-charge-versions.service.test.js:116 ~ it ~ result:', result)
      })
    })
  })
})
