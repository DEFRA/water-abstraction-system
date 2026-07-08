// Test framework dependencies

// Test helpers
import * as BillHelper from '../../../support/helpers/bill.helper.js'
import BillModel from '../../../../app/models/bill.model.js'
import * as BillLicenceHelper from '../../../support/helpers/bill-licence.helper.js'
import BillLicenceModel from '../../../../app/models/bill-licence.model.js'
import { generateUUID } from '../../../../app/lib/general.lib.js'
import * as TransactionHelper from '../../../support/helpers/transaction.helper.js'
import TransactionModel from '../../../../app/models/transaction.model.js'

// Things we need to stub
import * as FetchBillsToBeReissuedService from '../../../../app/services/bill-runs/reissue/fetch-bills-to-be-reissued.service.js'
import GlobalNotifierStub from '../../../support/stubs/global-notifier.stub.js'
import * as ReissueBillService from '../../../../app/services/bill-runs/reissue/reissue-bill.service.js'

// Thing under test
import ReissueBillsService from '../../../../app/services/bill-runs/reissue/reissue-bills.service.js'

describe('Reissue Bills service', () => {
  const reissueBillRun = { regionId: generateUUID() }

  let notifierStub
  beforeEach(async () => {
    // The service depends on GlobalNotifier to have been set. This happens in app/plugins/global-notifier.plugin.js
    // when the app starts up and the plugin is registered. As we're not creating an instance of Hapi server in this
    // test we recreate the condition by setting it directly with our own stub
    notifierStub = GlobalNotifierStub()
    globalThis.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.GlobalNotifier
  })

  describe('when the service is called', () => {
    describe('and there are no bills to reissue', () => {
      beforeEach(() => {
        vi.spyOn(FetchBillsToBeReissuedService, 'default').mockResolvedValue([])
      })

      it('returns "false"', async () => {
        const result = await ReissueBillsService(reissueBillRun)

        expect(result).toBe(false)
      })
    })

    describe('and there are bills to reissue', () => {
      let reissueBillOne
      let reissueBillTwo
      let reissueBillThree

      beforeEach(async () => {
        // Three dummy invoices to ensure we iterate 3x
        vi.spyOn(FetchBillsToBeReissuedService, 'default').mockResolvedValue([
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
        ReissueBillService.mockResolvedValueOnce(reissueBillOne)
        ReissueBillService.mockResolvedValueOnce(reissueBillTwo)
        ReissueBillService.mockResolvedValueOnce(reissueBillThree)
      })

      it('returns "true"', async () => {
        const result = await ReissueBillsService(reissueBillRun)

        expect(result).toBe(true)
      })

      it('persists all bills', async () => {
        await ReissueBillsService(reissueBillRun)

        const result = await BillModel.query().whereIn('billRunId', [
          reissueBillOne.bills[0].billRunId,
          reissueBillTwo.bills[0].billRunId,
          reissueBillThree.bills[0].billRunId
        ])

        expect(result).toHaveLength(3)
      })

      it('persists all bill licences', async () => {
        await ReissueBillsService(reissueBillRun)

        const result = await BillLicenceModel.query().whereIn('billId', [
          reissueBillOne.billLicences[0].billId,
          reissueBillTwo.billLicences[0].billId,
          reissueBillThree.billLicences[0].billId
        ])

        expect(result).toHaveLength(3)
      })

      it('persists all transactions', async () => {
        await ReissueBillsService(reissueBillRun)

        const result = await TransactionModel.query().whereIn('billLicenceId', [
          reissueBillOne.transactions[0].billLicenceId,
          reissueBillTwo.transactions[0].billLicenceId,
          reissueBillThree.transactions[0].billLicenceId
        ])

        expect(result).toHaveLength(3)
      })
    })
  })
})

function _reissueBillServiceResponse() {
  return {
    bills: [BillModel.fromJson(BillHelper.defaults())],
    billLicences: [BillLicenceModel.fromJson(BillLicenceHelper.defaults())],
    transactions: [
      TransactionModel.fromJson({
        ...TransactionHelper.defaults(),
        purposes: [
          {
            id: '01adfc33-4ba9-4215-bbe0-97014730991b',
            abstractionPeriodEndDay: 31,
            abstractionPeriodEndMonth: 3,
            abstractionPeriodStartDay: 1,
            abstractionPeriodStartMonth: 4
          }
        ]
      })
    ]
  }
}
