'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillRunVolumeHelper = require('../../support/helpers/water/bill-run-volume.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')

// Thing under test
const BillRunVolumeModel = require('../../../app/models/water/bill-run-volume.model.js')

describe('Bill Run Volume model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillRunVolumeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillRunVolumeModel.query().findById(testRecord.billingVolumeId)

      expect(result).to.be.an.instanceOf(BillRunVolumeModel)
      expect(result.billingVolumeId).to.equal(testRecord.billingVolumeId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()

        const { billingBatchId } = testBillRun
        testRecord = await BillRunVolumeHelper.add({ billingBatchId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query()
          .innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunVolumeModel.query()
          .findById(testRecord.billingVolumeId)
          .withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillRunVolumeModel)
        expect(result.billingVolumeId).to.equal(testRecord.billingVolumeId)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()

        const { chargeElementId } = testChargeReference
        testRecord = await BillRunVolumeHelper.add({ chargeElementId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await BillRunVolumeModel.query()
          .findById(testRecord.billingVolumeId)
          .withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(BillRunVolumeModel)
        expect(result.billingVolumeId).to.equal(testRecord.billingVolumeId)

        expect(result.chargeReference).to.be.an.instanceOf(ChargeReferenceModel)
        expect(result.chargeReference).to.equal(testChargeReference)
      })
    })
  })

  describe('Static getters', () => {
    describe('Two Part Tariff status codes', () => {
      it('returns the requested status code', async () => {
        const result = BillRunVolumeModel.twoPartTariffStatuses.noReturnsSubmitted

        expect(result).to.equal(10)
      })
    })
  })

  describe('$twoPartTariffStatus', () => {
    describe('when the two-part tariff status is set', () => {
      beforeEach(async () => {
        testRecord = await BillRunVolumeHelper.add({ twoPartTariffStatus: 90 })
      })

      it('returns the status', () => {
        const result = testRecord.$twoPartTariffStatus()

        expect(result).to.equal('returnLineOverlapsChargePeriod')
      })
    })

    describe('when the two-part tariff status is not set', () => {
      beforeEach(async () => {
        testRecord = await BillRunVolumeHelper.add()
      })

      it('returns null', () => {
        const result = testRecord.$twoPartTariffStatus()

        expect(result).to.be.null()
      })
    })
  })
})
