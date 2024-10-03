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
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')
const TransactionModel = require('../../../../app/models/transaction.model.js')

// Things we need to stub
const FetchBillsToBeReissuedService = require('../../../../app/services/bill-runs/reissue/fetch-bills-to-be-reissued.service.js')
const ReissueBillService = require('../../../../app/services/bill-runs/reissue/reissue-bill.service.js')

// Thing under test
const ReissueBillsService = require('../../../../app/services/bill-runs/reissue/reissue-bills.service.js')

describe('Reissue Bills service', () => {
  const reissueBillRun = { regionId: generateUUID() }

  let notifierStub
  let reissueBillServiceStub

  beforeEach(async () => {
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

      it('returns "false"', async () => {
        const result = await ReissueBillsService.go(reissueBillRun)

        expect(result).to.be.false()
      })
    })

    describe('and there are bills to reissue', () => {
      let reissueBillOne
      let reissueBillTwo
      let reissueBillThree

      beforeEach(async () => {
        // Three dummy invoices to ensure we iterate 3x
        Sinon.stub(FetchBillsToBeReissuedService, 'go').resolves([
          { id: generateUUID() },
          { id: generateUUID() },
          { id: generateUUID() }
        ])

        // The three new bills to be persisted
        reissueBillOne = _reissueBillServiceResponse()
        reissueBillTwo = _reissueBillServiceResponse()
        reissueBillThree = _reissueBillServiceResponse()

        // This stub will result in one new bill, bill licence and transaction for each dummy invoice returned by
        // FetchBillsToBeReissuedService.
        reissueBillServiceStub = Sinon.stub(ReissueBillService, 'go')
        reissueBillServiceStub.onFirstCall().resolves(reissueBillOne)
        reissueBillServiceStub.onSecondCall().resolves(reissueBillTwo)
        reissueBillServiceStub.onThirdCall().resolves(reissueBillThree)
      })

      it('returns "true"', async () => {
        const result = await ReissueBillsService.go(reissueBillRun)

        expect(result).to.be.true()
      })

      it('persists all bills', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await BillModel.query()
          .whereIn('billRunId', [
            reissueBillOne.bills[0].billRunId,
            reissueBillTwo.bills[0].billRunId,
            reissueBillThree.bills[0].billRunId
          ])

        expect(result).to.have.length(3)
      })

      it('persists all bill licences', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await BillLicenceModel.query()
          .whereIn('billId', [
            reissueBillOne.billLicences[0].billId,
            reissueBillTwo.billLicences[0].billId,
            reissueBillThree.billLicences[0].billId
          ])

        expect(result).to.have.length(3)
      })

      it('persists all transactions', async () => {
        await ReissueBillsService.go(reissueBillRun)

        const result = await TransactionModel.query()
          .whereIn('billLicenceId', [
            reissueBillOne.transactions[0].billLicenceId,
            reissueBillTwo.transactions[0].billLicenceId,
            reissueBillThree.transactions[0].billLicenceId
          ])

        expect(result).to.have.length(3)
      })
    })
  })
})

function _reissueBillServiceResponse () {
  return {
    bills: [BillModel.fromJson(BillHelper.defaults())],
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
