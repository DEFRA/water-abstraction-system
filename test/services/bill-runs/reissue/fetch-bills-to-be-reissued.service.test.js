'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillModel = require('../../../../app/models/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')

// Things we need to stub
const GlobalNotifierStub = require('../../../support/stubs/global-notifier.stub.js')

// Thing under test
const FetchBillsToBeReissuedService = require('../../../../app/services/bill-runs/reissue/fetch-bills-to-be-reissued.service.js')

describe('Fetch Bills To Be Reissued service', () => {
  let billRun
  let bill
  let regionId

  beforeEach(async () => {
    // We use a random regionId to avoid other tests writing bill run data in the same region which would effect the
    // tests. The service is not interested in any of the region data beyond its ID
    regionId = generateUUID()

    billRun = await BillRunHelper.add({ regionId })
    bill = await BillHelper.add({ billRunId: billRun.id })
    const { id: billLicenceId } = await BillLicenceHelper.add({ billId: bill.id })

    await TransactionHelper.add({ billLicenceId })
  })

  describe('when there are no bills to be reissued', () => {
    it('returns no results', async () => {
      const result = await FetchBillsToBeReissuedService(regionId)

      expect(result).toHaveLength(0)
    })
  })

  describe('when there are bills to be reissued', () => {
    beforeEach(async () => {
      await bill.$query().patch({ flaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchBillsToBeReissuedService(regionId)

      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(BillModel)
    })

    it('returns only the required bill fields', async () => {
      const bill = await FetchBillsToBeReissuedService(regionId)

      const result = Object.keys(bill[0])

      expect(result.sort()).toEqual(
        [
          'id',
          'externalId',
          'financialYearEnding',
          'billingAccountId',
          'accountNumber',
          'billLicences',
          'originalBillId'
        ].sort()
      )
    })

    it('returns only the required bill licence fields', async () => {
      const bill = await FetchBillsToBeReissuedService(regionId)

      const { billLicences } = bill[0]

      const result = Object.keys(billLicences[0])

      expect(result.sort()).toEqual(['licenceRef', 'licenceId', 'transactions'].sort())
    })

    describe('and there are alcs bills to be reissued', () => {
      beforeEach(async () => {
        const alcsBillRun = await BillRunHelper.add({ regionId, scheme: 'alcs' })
        const alcsBill = await BillHelper.add({
          billRunId: alcsBillRun.id,
          flaggedForRebilling: true
        })
        const { id: alcsBillLicenceId } = await BillLicenceHelper.add({
          billId: alcsBill.id
        })

        await TransactionHelper.add({ billLicenceId: alcsBillLicenceId })
      })

      it('returns only sroc bills', async () => {
        const result = await FetchBillsToBeReissuedService(regionId)

        expect(result).toHaveLength(1)
        expect(result[0].id).toEqual(bill.id)
      })
    })
  })

  describe('when fetching from the db fails', () => {
    let notifierStub

    beforeEach(() => {
      notifierStub = GlobalNotifierStub.build(Sinon)
      globalThis.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      Sinon.restore()
      delete globalThis.GlobalNotifier
    })

    it('logs an error', async () => {
      // Force an error by calling the service with an invalid uuid
      await FetchBillsToBeReissuedService('NOT_A_UUID')

      expect(notifierStub.omfg.calledWith('Could not fetch reissue bills')).toBe(true)
    })

    it('returns an empty array', async () => {
      const result = await FetchBillsToBeReissuedService(regionId)

      expect(result).toHaveLength(0)
    })
  })
})
