'use strict'

// Test helpers
const BillRunHelper = require('../../support/helpers/water/bill-run.helper.js')
const BillRunModel = require('../../../app/models/water/bill-run.model.js')
const BillRunVolumeHelper = require('../../support/helpers/water/bill-run-volume.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeReferenceModel = require('../../../app/models/water/charge-reference.model.js')

// Thing under test
const BillRunVolumeModel = require('../../../app/models/water/bill-run-volume.model.js')

describe('Bill Run Volume model', () => {
  let testBillRun
  let testChargeReference
  let testRecord

  beforeEach(async () => {
    testBillRun = await BillRunHelper.add()
    testChargeReference = await ChargeReferenceHelper.add()

    const { billingBatchId } = testBillRun
    const { chargeElementId } = testChargeReference
    testRecord = await BillRunVolumeHelper.add({ billingBatchId, chargeElementId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunVolumeModel.query().findById(testRecord.billingVolumeId)

      expect(result).toBeInstanceOf(BillRunVolumeModel)
      expect(result.billingVolumeId).toBe(testRecord.billingVolumeId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query()
          .innerJoinRelated('billRun')

        expect(query).toBeTruthy()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunVolumeModel.query()
          .findById(testRecord.billingVolumeId)
          .withGraphFetched('billRun')

        expect(result).toBeInstanceOf(BillRunVolumeModel)
        expect(result.billingVolumeId).toBe(testRecord.billingVolumeId)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query()
          .innerJoinRelated('chargeReference')

        expect(query).toBeTruthy()
      })

      it('can eager load the charge reference', async () => {
        const result = await BillRunVolumeModel.query()
          .findById(testRecord.billingVolumeId)
          .withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(BillRunVolumeModel)
        expect(result.billingVolumeId).toBe(testRecord.billingVolumeId)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })
  })

  describe('Static getters', () => {
    describe('Two Part Tariff status codes', () => {
      it('returns the requested status code', async () => {
        const result = BillRunVolumeModel.twoPartTariffStatuses.noReturnsSubmitted

        expect(result).toBe(10)
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

        expect(result).toBe('returnLineOverlapsChargePeriod')
      })
    })

    describe('when the two-part tariff status is not set', () => {
      beforeEach(async () => {
        testRecord = await BillRunVolumeHelper.add()
      })

      it('returns null', () => {
        const result = testRecord.$twoPartTariffStatus()

        expect(result).toBeNull()
      })
    })
  })
})
