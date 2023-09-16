'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/water/bill-run.helper.js')
const BillHelper = require('../../../support/helpers/water/bill.helper.js')
const BillLicenceHelper = require('../../../support/helpers/water/bill-licence.helper.js')
const ChargeElementHelper = require('../../../support/helpers/water/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/water/charge-reference.helper.js')
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LicenceHelper = require('../../../support/helpers/water/licence.helper.js')
const PurposeHelper = require('../../../support/helpers/water/purpose.helper.js')
const RegionHelper = require('../../../support/helpers/water/region.helper.js')
const TransactionHelper = require('../../../support/helpers/water/transaction.helper.js')

// Things we need to stub
const GenerateMockDataService = require('../../../../app/services/data/mock/generate-mock-data.service.js')

// Thing under test
const GenerateBillRunService = require('../../../../app/services/data/mock/generate-bill-run.service.js')

describe('Generate Bill Run service', () => {
  let billRunId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const generateMockDataServiceStub = Sinon.stub(GenerateMockDataService, 'go')

    generateMockDataServiceStub.onFirstCall().returns({
      address: ['7 Fake Court', 'Fakechester', 'FO68 7EJ'],
      name: 'Jason White'
    })

    generateMockDataServiceStub.onSecondCall().returns({
      address: ['9 Fake Street', 'Fakesville', 'FT12 3BA'],
      name: 'Rebecca Barrett'
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a bill run with a matching ID exists', () => {
    beforeEach(async () => {
      const region = await RegionHelper.add()
      const licence = await LicenceHelper.add({ regionId: region.regionId })
      const purpose = await PurposeHelper.add()
      const chargeReference = await ChargeReferenceHelper.add({
        adjustments: { s126: null, s127: false, s130: false, charge: null, winter: true, aggregate: null }
      })
      await ChargeElementHelper.add({ chargeElementId: chargeReference.chargeElementId, purposeUseId: purpose.purposeUseId })
      const billRun = await BillRunHelper.add({ billRunNumber: 10029, regionId: region.regionId })
      const bill = await BillHelper.add({ billingBatchId: billRun.billingBatchId, invoiceNumber: 'TAI0000013T' })
      const billLicence = await BillLicenceHelper.add({ billingInvoiceId: bill.billingInvoiceId, licenceId: licence.licenceId })
      await TransactionHelper.add({
        billingInvoiceLicenceId: billLicence.billingInvoiceLicenceId,
        chargeElementId: chargeReference.chargeElementId,
        endDate: new Date(2023, 2, 31, 2),
        netAmount: 4200,
        startDate: new Date(2022, 3, 1, 2),
        grossValuesCalculated: {
          baselineCharge: 1162,
          supportedSourceCharge: 518
        }
      })

      billRunId = billRun.billingBatchId
    })

    it('returns the generated mock bill run', async () => {
      const result = await GenerateBillRunService.go(billRunId)

      expect(result.billRunNumber).to.equal(10029)
    })

    it('adds a mock address to the bills', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].accountAddress).to.equal(['7 Fake Court', 'Fakechester', 'FO68 7EJ'])
    })

    it('adds a mock contact to the bills', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].contact).to.equal('Jason White')
    })

    it('masks the invoiceAccountNumber on the bills', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].account).to.equal('Z11345678A')
    })

    it('masks the invoiceNumber on the bills', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].number).to.equal('ZZI0000013T')
    })

    it('adds a mock licence holder to the licences', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].licences[0].licenceHolder).to.equal('Rebecca Barrett')
    })

    it('adds calculated transaction totals to the licences', async () => {
      const { bills: results } = await GenerateBillRunService.go(billRunId)

      expect(results[0].licences[0].credit).to.equal('0.00')
      expect(results[0].licences[0].debit).to.equal('42.00')
      expect(results[0].licences[0].netTotal).to.equal('42.00')
    })
  })

  describe('when a bill run with a matching ID does not exist', () => {
    beforeEach(() => {
      billRunId = 'b845bcc3-a5bd-4e42-9ed2-b3e27a837e85'
    })

    it('throws an error', async () => {
      const error = await expect(GenerateBillRunService.go(billRunId)).to.reject()

      expect(error).to.be.an.error()
      expect(error.message).to.equal('No matching bill run exists')
    })
  })
})
