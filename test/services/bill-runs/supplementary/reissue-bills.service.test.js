'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillModel = require('../../../../app/models/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillLicenceModel = require('../../../../app/models/bill-licence.model.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')
const TransactionModel = require('../../../../app/models/transaction.model.js')

// Things we need to stub
const LegacyRequestLib = require('../../../../app/lib/legacy-request.lib.js')
const FetchBillsToBeReissuedService = require('../../../../app/services/bill-runs/supplementary/fetch-bills-to-be-reissued.service.js')
const ReissueBillService = require('../../../../app/services/bill-runs/supplementary/reissue-bill.service.js')

// Thing under test
const ReissueBillsService = require('../../../../app/services/bill-runs/supplementary/reissue-bills.service.js')

describe('Reissue Bills service', () => {
  const reissueBillRun = { regionId: generateUUID() }

  let notifierStub
  let reissueBillServiceStub

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

        // This stub will result in one new bill, bill licence and transaction for each dummy invoice returned by
        // FetchBillsToBeReissuedService. We have to provide a different bill run id for each else we cause the error
        // `duplicate key value violates unique constraint "unique_batch_year_invoice"`
        reissueBillServiceStub = Sinon.stub(ReissueBillService, 'go')
        reissueBillServiceStub.onFirstCall()
          .resolves(_reissueBillServiceResponse('94e75ac4-111b-4600-8b2c-e3e39c5a8549'))
        reissueBillServiceStub.onSecondCall()
          .resolves(_reissueBillServiceResponse('6f21fce5-2f86-4939-909a-ce4339b5a448'))
        reissueBillServiceStub.onThirdCall()
          .resolves(_reissueBillServiceResponse('09aab25a-4fd2-42d5-8c7a-6a3777b01bba'))
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

        const result = await TransactionModel.query()

        expect(result).to.have.length(3)
      })
    })
  })
})

function _reissueBillServiceResponse (billRunId) {
  return {
    bills: [BillModel.fromJson({ ...BillHelper.defaults(), billRunId })],
    billLicences: [BillLicenceModel.fromJson(BillLicenceHelper.defaults())],
    transactions: [TransactionModel.fromJson({
      ...TransactionHelper.defaults(),
      purposes: [{
        id: '01adfc33-4ba9-4215-bbe0-97014730991b',
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4
      }]
    })]
  }
}
