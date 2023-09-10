'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../../app/models/water/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/water/bill-licence.helper.js')
const BillLicenceModel = require('../../../../app/models/water/bill-licence.model.js')
const BillingTransactionHelper = require('../../../support/helpers/water/billing-transaction.helper.js')
const BillingTransactionModel = require('../../../../app/models/water/billing-transaction.model.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Things we need to stub
const LegacyRequestLib = require('../../../../app/lib/legacy-request.lib.js')
const FetchBillsToBeReissuedService = require('../../../../app/services/billing/supplementary/fetch-bills-to-be-reissued.service.js')
const ReissueBillService = require('../../../../app/services/billing/supplementary/reissue-bill.service.js')

// Thing under test
const ReissueBillsService = require('../../../../app/services/billing/supplementary/reissue-bills.service.js')

describe('Reissue Bills service', () => {
  const reissueBillRun = { regionId: generateUUID() }

  let notifierStub

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
    describe('and there are no bills to reissue', () => {
      beforeEach(() => {
        Sinon.stub(FetchBillsToBeReissuedService, 'go').resolves([])
      })

      it('returns `false`', async () => {
        const result = await ReissueBillsService.go(reissueBillRun)

        expect(result).to.be.false()
      })
    })

    describe('and there are bills to reissue', () => {
      beforeEach(async () => {
        // Three dummy invoices to ensure we iterate 3x
        Sinon.stub(FetchBillsToBeReissuedService, 'go').resolves([
          { id: generateUUID() },
          { id: generateUUID() },
          { id: generateUUID() }
        ])

        // This stub will result in one new bill, bill licence and transaction for each dummy invoice
        Sinon.stub(ReissueBillService, 'go').resolves({
          bills: [BillModel.fromJson(BillHelper.defaults())],
          billLicences: [BillLicenceModel.fromJson(BillLicenceHelper.defaults())],
          billingTransactions: [BillingTransactionModel.fromJson({
            ...BillingTransactionHelper.defaults(),
            purposes: [{
              chargePurposeId: '01adfc33-4ba9-4215-bbe0-97014730991b',
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 4
            }]
          })]
        })
      })

      it('returns `true`', async () => {
        const result = await ReissueBillsService.go(reissueBillRun)

        expect(result).to.be.true()
      })

      it('persists all bills', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await BillModel.query()

        expect(result).to.have.length(3)
      })

      it('persists all bill licences', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await BillLicenceModel.query()

        expect(result).to.have.length(3)
      })

      it('persists all transactions', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await BillingTransactionModel.query()

        expect(result).to.have.length(3)
      })
    })
  })
})
