'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillHelper = require('../../../support/helpers/bill.helper.js')
const BillModel = require('../../../../app/models/bill.model.js')
const BillLicenceHelper = require('../../../support/helpers/bill-licence.helper.js')
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const TransactionHelper = require('../../../support/helpers/transaction.helper.js')

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
      const result = await FetchBillsToBeReissuedService.go(regionId)

      expect(result).to.be.empty()
    })
  })

  describe('when there are bills to be reissued', () => {
    beforeEach(async () => {
      await bill.$query().patch({ flaggedForRebilling: true })
    })

    it('returns results', async () => {
      const result = await FetchBillsToBeReissuedService.go(regionId)

      expect(result).to.have.length(1)
      expect(result[0]).to.be.an.instanceOf(BillModel)
    })

    it('returns only the required bill fields', async () => {
      const bill = await FetchBillsToBeReissuedService.go(regionId)

      const result = Object.keys(bill[0])

      expect(result).to.only.include([
        'id',
        'externalId',
        'financialYearEnding',
        'billingAccountId',
        'accountNumber',
        'billLicences',
        'originalBillId'
      ])
    })

    it('returns only the required bill licence fields', async () => {
      const bill = await FetchBillsToBeReissuedService.go(regionId)

      const { billLicences } = bill[0]

      const result = Object.keys(billLicences[0])

      expect(result).to.only.include([
        'licenceRef',
        'licenceId',
        'transactions'
      ])
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
        const result = await FetchBillsToBeReissuedService.go(regionId)

        expect(result).to.have.length(1)
        expect(result[0].id).to.equal(bill.id)
      })
    })
  })

  describe('when fetching from the db fails', () => {
    let notifierStub

    beforeEach(() => {
      notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
      global.GlobalNotifier = notifierStub
    })

    afterEach(() => {
      delete global.GlobalNotifier
      Sinon.restore()
    })

    it('logs an error', async () => {
      // Force an error by calling the service with an invalid uuid
      await FetchBillsToBeReissuedService.go('NOT_A_UUID')

      expect(notifierStub.omfg.calledWith('Could not fetch reissue bills')).to.be.true()
    })

    it('returns an empty array', async () => {
      const result = await FetchBillsToBeReissuedService.go(regionId)

      expect(result).to.be.empty()
    })
  })
})
