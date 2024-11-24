'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')
const BillModel = require('../../../app/models/bill.model.js')
const BillRunHelper = require('../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../app/models/bill-run.model.js')
const RegionHelper = require('../../support/helpers/region.helper.js')
const RegionModel = require('../../../app/models/region.model.js')
const TransactionHelper = require('../../support/helpers/transaction.helper.js')

// Thing under test
const FetchBillService = require('../../../app/services/bills/fetch-bill-service.js')

describe('Fetch Bill service', () => {
  let linkedBillLicences
  let linkedBillRun
  let linkedRegion
  let testBill
  let unlinkedBillLicence

  beforeEach(async () => {
    linkedRegion = RegionHelper.select()
    linkedBillRun = await BillRunHelper.add({ regionId: linkedRegion.id })

    testBill = await BillHelper.add({ billRunId: linkedBillRun.id })

    linkedBillLicences = await Promise.all([
      BillLicenceHelper.add({ billId: testBill.id }),
      BillLicenceHelper.add({ billId: testBill.id })
    ])

    await Promise.all([
      TransactionHelper.add({ billLicenceId: linkedBillLicences[0].id, netAmount: 10 }),
      TransactionHelper.add({ billLicenceId: linkedBillLicences[0].id, netAmount: 20 }),
      TransactionHelper.add({ billLicenceId: linkedBillLicences[1].id, netAmount: 30 }),
      TransactionHelper.add({ billLicenceId: linkedBillLicences[1].id, netAmount: 40 })
    ])

    // Add an unlinked BillLicence and Transaction to demonstrate only linked ones are returned
    unlinkedBillLicence = await BillLicenceHelper.add()
    await TransactionHelper.add({ billLicenceId: unlinkedBillLicence.id, netAmount: 50 })
  })

  describe('when a bill with a matching ID exists', () => {
    it('returns the matching instance of BillModel', async () => {
      const { bill: result } = await FetchBillService.go(testBill.id)

      expect(result.id).to.equal(testBill.id)
      expect(result).to.be.an.instanceOf(BillModel)
    })

    it('returns the matching bill including the linked bill run', async () => {
      const { bill: result } = await FetchBillService.go(testBill.id)
      const { billRun: returnedBillRun } = result

      expect(result.id).to.equal(testBill.id)
      expect(result).to.be.an.instanceOf(BillModel)

      expect(returnedBillRun.id).to.equal(linkedBillRun.id)
      expect(returnedBillRun).to.be.an.instanceOf(BillRunModel)
    })

    it('returns the matching bill including the linked bill run and the region it is linked to', async () => {
      const { bill: result } = await FetchBillService.go(testBill.id)
      const { region: returnedRegion } = result.billRun

      expect(result.id).to.equal(testBill.id)
      expect(result).to.be.an.instanceOf(BillModel)

      expect(returnedRegion.id).to.equal(linkedRegion.id)
      expect(returnedRegion).to.be.an.instanceOf(RegionModel)
    })

    it('returns a transaction summary for each licence linked to the bill', async () => {
      const { licenceSummaries: result } = await FetchBillService.go(testBill.id)

      expect(result).to.have.length(2)
      expect(result).to.include({
        id: linkedBillLicences[0].id,
        licenceRef: linkedBillLicences[0].licenceRef,
        total: 30
      })
      expect(result).to.include({
        id: linkedBillLicences[1].id,
        licenceRef: linkedBillLicences[1].licenceRef,
        total: 70
      })

      expect(result).not.to.include({
        id: unlinkedBillLicence.id,
        licenceRef: unlinkedBillLicence.licenceRef,
        total: 50
      })
    })
  })

  describe('when a bill with a matching ID does not exist', () => {
    it('returns a result with no values set', async () => {
      const result = await FetchBillService.go('93112100-152b-4860-abea-2adee11dcd69')

      expect(result).to.exist()
      expect(result.bill).to.equal(undefined)
      expect(result.licenceSummaries).to.equal([])
    })
  })
})
