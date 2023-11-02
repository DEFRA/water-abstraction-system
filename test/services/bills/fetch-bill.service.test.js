'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/water/bill.helper.js')
const BillModel = require('../../../app/models/water/bill.model.js')
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillLicenceHelper = require('../../support/helpers/water/bill-licence.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const RegionModel = require('../../../app/models/water/region.model.js')
const TransactionHelper = require('../../support/helpers/water/transaction.helper.js')

// Thing under test
const FetchBillService = require('../../../app/services/bills/fetch-bill-service.js')

describe('Fetch Bill service', () => {
  let linkedBillLicences
  let linkedBillRun
  let linkedRegion
  let testBill
  let unlinkedBillLicence

  beforeEach(async () => {
    await DatabaseHelper.clean()

    linkedRegion = await RegionHelper.add()
    linkedBillRun = await BillRunHelper.add({ regionId: linkedRegion.regionId })

    testBill = await BillHelper.add({ billingBatchId: linkedBillRun.billingBatchId })

    linkedBillLicences = await Promise.all([
      BillLicenceHelper.add({ billingInvoiceId: testBill.billingInvoiceId }),
      BillLicenceHelper.add({ billingInvoiceId: testBill.billingInvoiceId })
    ])

    await Promise.all([
      TransactionHelper.add({ billingInvoiceLicenceId: linkedBillLicences[0].billingInvoiceLicenceId, netAmount: 10 }),
      TransactionHelper.add({ billingInvoiceLicenceId: linkedBillLicences[0].billingInvoiceLicenceId, netAmount: 20 }),
      TransactionHelper.add({ billingInvoiceLicenceId: linkedBillLicences[1].billingInvoiceLicenceId, netAmount: 30 }),
      TransactionHelper.add({ billingInvoiceLicenceId: linkedBillLicences[1].billingInvoiceLicenceId, netAmount: 40 })
    ])

    // Add an unlinked BillLicence and Transaction to demonstrate only linked ones are returned
    unlinkedBillLicence = await BillLicenceHelper.add()
    await TransactionHelper.add({ billingInvoiceLicenceId: unlinkedBillLicence.billingInvoiceLicenceId, netAmount: 50 })
  })

  describe('when a bill with a matching ID exists', () => {
    it('returns the matching instance of BillModel', async () => {
      const { bill: result } = await FetchBillService.go(testBill.billingInvoiceId)

      expect(result.billingInvoiceId).to.equal(testBill.billingInvoiceId)
      expect(result).to.be.an.instanceOf(BillModel)
    })

    it('returns the matching bill including the linked bill run', async () => {
      const { bill: result } = await FetchBillService.go(testBill.billingInvoiceId)
      const { billRun: returnedBillRun } = result

      expect(result.billingInvoiceId).to.equal(testBill.billingInvoiceId)
      expect(result).to.be.an.instanceOf(BillModel)

      expect(returnedBillRun.billingBatchId).to.equal(linkedBillRun.billingBatchId)
      expect(returnedBillRun).to.be.an.instanceOf(BillRunModel)
    })

    it('returns the matching bill including the linked bill run and the region it is linked to', async () => {
      const { bill: result } = await FetchBillService.go(testBill.billingInvoiceId)
      const { region: returnedRegion } = result.billRun

      expect(result.billingInvoiceId).to.equal(testBill.billingInvoiceId)
      expect(result).to.be.an.instanceOf(BillModel)

      expect(returnedRegion.regionId).to.equal(linkedRegion.regionId)
      expect(returnedRegion).to.be.an.instanceOf(RegionModel)
    })

    it('returns a transaction summary for each licence linked to the bill', async () => {
      const { licenceSummaries: result } = await FetchBillService.go(testBill.billingInvoiceId)

      expect(result).to.have.length(2)
      expect(result).to.include({
        billingInvoiceLicenceId: linkedBillLicences[0].billingInvoiceLicenceId,
        licenceRef: linkedBillLicences[0].licenceRef,
        total: 30
      })
      expect(result).to.include({
        billingInvoiceLicenceId: linkedBillLicences[1].billingInvoiceLicenceId,
        licenceRef: linkedBillLicences[1].licenceRef,
        total: 70
      })

      expect(result).not.to.include({
        billingInvoiceLicenceId: unlinkedBillLicence.billingInvoiceLicenceId,
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
