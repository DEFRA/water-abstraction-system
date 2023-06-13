'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillingBatchHelper = require('../../support/helpers/water/billing-batch.helper.js')
const BillingInvoiceHelper = require('../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceLicenceHelper = require('../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingTransactionHelper = require('../../support/helpers/water/billing-transaction.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Things we need to stub
const ChargingModuleReissueInvoiceService = require('../../../app/services/charging-module/reissue-invoice.service.js')
const ChargingModuleViewInvoiceService = require('../../../app/services/charging-module/view-invoice.service.js')
const HandleErroredBillingBatchService = require('../../../app/services/supplementary-billing/handle-errored-billing-batch.service.js')
const LegacyRequestLib = require('../../../app/lib/legacy-request.lib.js')

// Thing under test
const ReissueInvoicesService = require('../../../app/services/supplementary-billing/reissue-invoices.service.js')

const BILLING_BATCH_EXTERNAL_ID = 'f68fedc4-bb26-43b9-9c69-504ba7d2ca18'
const INVOICE_EXTERNAL_ID = '1699fe7c-c4ff-4b4b-a1b8-3026b83a00a1'

const CHARGING_MODULE_REISSUE_INVOICE_RESPONSE = {
  invoices: [
    {
      id: 'f62faabc-d65e-4242-a106-9777c1d57db7',
      rebilledType: 'C'
    },
    {
      id: 'db82bf38-638a-44d3-b1b3-1ae8524d9c38',
      rebilledType: 'R'
    }
  ]
}

const CHARGING_MODULE_VIEW_INVOICE_RESPONSES = {
  credit: {
    invoice: {
      id: 'f62faabc-d65e-4242-a106-9777c1d57db7',
      billRunId: 'f68fedc4-bb26-43b9-9c69-504ba7d2ca18',
      ruleset: 'sroc',
      customerReference: 'CUSTOMER_REF',
      financialYear: 2022,
      deminimisInvoice: false,
      zeroValueInvoice: false,
      transactionReference: null,
      creditLineValue: 6600,
      debitLineValue: 0,
      netTotal: -6600,
      rebilledType: 'C',
      rebilledInvoiceId: '1699fe7c-c4ff-4b4b-a1b8-3026b83a00a1',
      licences: [
        {
          id: 'fb79cde3-c684-4078-b08f-be6f06eb51a0',
          licenceNumber: '01/123',
          netTotal: -6600,
          transactions: [
            {
              id: 'd21d1d58-9b1b-41e0-95ed-d51771d7e936',
              clientId: null,
              chargeValue: 6600,
              credit: true,
              lineDescription: 'LINE_DESCRIPTION',
              periodStart: '2022-04-01T00:00:00.000Z',
              periodEnd: '2023-03-31T00:00:00.000Z',
              compensationCharge: false,
              rebilledTransactionId: 'a844ec8e-7ee1-4771-b645-a2459045a31a',
              section130Factor: 0.5,
              section127Factor: null,
              winterOnlyFactor: null,
              calculation: {
                __DecisionID__: 'd3074324-61e3-4ff2-83e1-9f398d0603d00',
                WRLSChargingResponse: {
                  chargeValue: 66,
                  abatementAdjustment: null,
                  s127Agreement: null,
                  s130Agreement: 'CRT Discount x 0.5',
                  decisionPoints: {
                    baselineCharge: 97,
                    secondPartCharge: false,
                    compensationCharge: false,
                    abatementAdjustment: 66,
                    s127Agreement: 66,
                    s130Agreement: 66,
                    waterCompanyCharge: 97,
                    winterOnlyCharge: 132,
                    supportedSourceCharge: 132,
                    secondPartProRata: 66,
                    waterCompanyChargeFlag: false,
                    compensationChargeValue: 0,
                    aggregatedCharge: 132,
                    winterOnly: false,
                    supportedSourceChargeFlag: false,
                    adjustmentFactor: 66
                  },
                  messages: [],
                  baselineCharge: 97,
                  supportedSourceCharge: 35,
                  waterCompanyCharge: 0,
                  compensationChargePercentage: null,
                  winterOnlyAdjustment: null,
                  adjustmentFactor: null
                }
              }
            }
          ]
        }
      ]
    }
  },
  reissue: {
    invoice: {
      id: 'db82bf38-638a-44d3-b1b3-1ae8524d9c38',
      billRunId: 'f68fedc4-bb26-43b9-9c69-504ba7d2ca18',
      ruleset: 'sroc',
      customerReference: 'CUSTOMER_REF',
      financialYear: 2022,
      deminimisInvoice: false,
      zeroValueInvoice: false,
      transactionReference: null,
      creditLineValue: 0,
      debitLineValue: 6600,
      netTotal: 6600,
      rebilledType: 'R',
      rebilledInvoiceId: '1699fe7c-c4ff-4b4b-a1b8-3026b83a00a1',
      licences: [
        {
          id: 'c11c33e2-bbb0-46e6-a6be-707ae57762de',
          licenceNumber: '01/123',
          netTotal: 6600,
          transactions: [
            {
              id: '741a79d7-9a3c-4d7c-9ce4-b89c05ff9025',
              clientId: null,
              chargeValue: 6600,
              credit: false,
              lineDescription: 'LINE_DESCRIPTION',
              periodStart: '2022-04-01T00:00:00.000Z',
              periodEnd: '2023-03-31T00:00:00.000Z',
              compensationCharge: false,
              rebilledTransactionId: 'a844ec8e-7ee1-4771-b645-a2459045a31a',
              section130Factor: 0.5,
              section127Factor: null,
              winterOnlyFactor: null,
              calculation: {
                __DecisionID__: 'd3074324-61e3-4ff2-83e1-9f398d0603d00',
                WRLSChargingResponse: {
                  chargeValue: 66,
                  abatementAdjustment: null,
                  s127Agreement: null,
                  s130Agreement: 'CRT Discount x 0.5',
                  decisionPoints: {
                    baselineCharge: 97,
                    secondPartCharge: false,
                    compensationCharge: false,
                    abatementAdjustment: 66,
                    s127Agreement: 66,
                    s130Agreement: 66,
                    waterCompanyCharge: 97,
                    winterOnlyCharge: 132,
                    supportedSourceCharge: 132,
                    secondPartProRata: 66,
                    waterCompanyChargeFlag: false,
                    compensationChargeValue: 0,
                    aggregatedCharge: 132,
                    winterOnly: false,
                    supportedSourceChargeFlag: false,
                    adjustmentFactor: 66
                  },
                  messages: [],
                  baselineCharge: 97,
                  supportedSourceCharge: 35,
                  waterCompanyCharge: 0,
                  compensationChargePercentage: null,
                  winterOnlyAdjustment: null,
                  adjustmentFactor: null
                }
              }
            }
          ]
        }
      ]
    }
  }
}

describe.only('Reissue invoices service', () => {
  let billingBatch
  let billingTransactionToReissue
  let invoiceToReissue
  let chargingModuleReissueInvoiceServiceStub
  let chargingModuleViewInvoiceServiceStub
  let handleErroredBillingBatchStub
  let legacyRequestLibStub
  let notifierStub

  beforeEach(async () => {
    await DatabaseHelper.clean()

    billingBatch = await BillingBatchHelper.add({ externalId: BILLING_BATCH_EXTERNAL_ID })
    await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: billingBatch.billingBatchId })

    handleErroredBillingBatchStub = Sinon.stub(HandleErroredBillingBatchService, 'go')

    chargingModuleReissueInvoiceServiceStub = Sinon.stub(ChargingModuleReissueInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, INVOICE_EXTERNAL_ID)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_REISSUE_INVOICE_RESPONSE
      })

    chargingModuleViewInvoiceServiceStub = Sinon.stub(ChargingModuleViewInvoiceService, 'go')
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES.credit.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES.credit
      })
      .withArgs(BILLING_BATCH_EXTERNAL_ID, CHARGING_MODULE_VIEW_INVOICE_RESPONSES.reissue.invoice.id)
      .resolves({
        succeeded: true,
        response: CHARGING_MODULE_VIEW_INVOICE_RESPONSES.reissue
      })

    legacyRequestLibStub = Sinon.stub(LegacyRequestLib, 'post')

    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when the service is called', () => {
    beforeEach(() => {
      // Sinon.stub(FetchChargeVersionsService, 'go').resolves([])
      // Sinon.stub(UnflagUnbilledLicencesService, 'go')
    })

    describe('and there are no invoices to reissue', () => {
      it('returns `false`', async () => {
        const result = await ReissueInvoicesService.go(billingBatch, 2023)

        expect(result).to.be.false()
      })
    })

    describe('and there are invoices to reissue', () => {
      beforeEach(async () => {
        const billingInvoiceToReissue = await BillingInvoiceHelper.add({ financialYearEnding: 2023, billingBatchId: billingBatch.billingBatchId, isFlaggedForRebilling: true, externalId: INVOICE_EXTERNAL_ID })
        const billingInvoiceLicenceToReissue = await BillingInvoiceLicenceHelper.add({ billingInvoiceId: billingInvoiceToReissue.billingInvoiceId })
        billingTransactionToReissue = await BillingTransactionHelper.add({ billingInvoiceLicenceId: billingInvoiceLicenceToReissue.billingInvoiceLicenceId, externalId: 'a844ec8e-7ee1-4771-b645-a2459045a31a' })
      })

      it('returns `true`', async () => {
        const result = await ReissueInvoicesService.go(billingBatch, 2023)

        expect(result).to.be.true()
      })
    })
  })
})
