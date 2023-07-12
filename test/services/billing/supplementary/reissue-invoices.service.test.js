'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

const { randomUUID } = require('crypto')

// Test helpers
const BillingInvoiceHelper = require('../../../support/helpers/water/billing-invoice.helper.js')
const BillingInvoiceModel = require('../../../../app/models/water/billing-invoice.model.js')
const BillingInvoiceLicenceHelper = require('../../../support/helpers/water/billing-invoice-licence.helper.js')
const BillingInvoiceLicenceModel = require('../../../../app/models/water/billing-invoice-licence.model.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../../app/models/water/billing-transaction.model.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')

// Things we need to stub
const LegacyRequestLib = require('../../../../app/lib/legacy-request.lib.js')
const FetchInvoicesToBeReissuedService = require('../../../../app/services/billing/supplementary/fetch-invoices-to-be-reissued.service.js')
const ReissueInvoiceService = require('../../../../app/services/billing/supplementary/reissue-invoice.service.js')

// Thing under test
const ReissueInvoicesService = require('../../../../app/services/billing/supplementary/reissue-invoices.service.js')

describe('Reissue invoices service', () => {
  let notifierStub
  const reissueBillingBatch = { regionId: randomUUID({ disableEntropyCache: true }) }

  beforeEach(async () => {
    await DatabaseHelper.clean()

    Sinon.stub(LegacyRequestLib, 'post')

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
    describe('and there are no invoices to reissue', () => {
      beforeEach(() => {
        Sinon.stub(FetchInvoicesToBeReissuedService, 'go').resolves([])
      })

      it('returns `false`', async () => {
        const result = await ReissueInvoicesService.go(reissueBillingBatch)

        expect(result).to.be.false()
      })
    })

    describe('and there are invoices to reissue', () => {
      beforeEach(async () => {
        // Three dummy invoices to ensure we iterate 3x
        Sinon.stub(FetchInvoicesToBeReissuedService, 'go').resolves([
          { id: randomUUID({ disableEntropyCache: true }) },
          { id: randomUUID({ disableEntropyCache: true }) },
          { id: randomUUID({ disableEntropyCache: true }) }
        ])

        // This stub will result in one new invoice, invoice licence and transaction for each dummy invoice
        Sinon.stub(ReissueInvoiceService, 'go').resolves({
          billingInvoices: [BillingInvoiceModel.fromJson(BillingInvoiceHelper.defaults())],
          billingInvoiceLicences: [BillingInvoiceLicenceModel.fromJson(BillingInvoiceLicenceHelper.defaults())],
          billingTransactions: [BillingTransactionModel.fromJson(BillingTransactionHelper.defaults())]
        })
      })

      it('returns `true`', async () => {
        const result = await ReissueInvoicesService.go(reissueBillingBatch)

        expect(result).to.be.true()
      })

      it('persists all billing invoices', async () => {
        await ReissueInvoicesService.go(reissueBillingBatch)

        const result = await BillingInvoiceModel.query()

        expect(result).to.have.length(3)
      })

      it('persists all billing invoice licences', async () => {
        await ReissueInvoicesService.go(reissueBillingBatch)

        const result = await BillingInvoiceLicenceModel.query()

        expect(result).to.have.length(3)
      })

      it('persists all transactions', async () => {
        await ReissueInvoicesService.go(reissueBillingBatch)

        const result = await BillingTransactionModel.query()

        expect(result).to.have.length(3)
      })
    })
  })
})
