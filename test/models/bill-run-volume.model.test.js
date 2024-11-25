'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunHelper = require('../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../app/models/bill-run.model.js')
const BillRunVolumeHelper = require('../support/helpers/bill-run-volume.helper.js')
const ChargeReferenceHelper = require('../support/helpers/charge-reference.helper.js')
const ChargeReferenceModel = require('../../app/models/charge-reference.model.js')

// Thing under test
const BillRunVolumeModel = require('../../app/models/bill-run-volume.model.js')

describe('Bill Run Volume model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await BillRunVolumeHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await BillRunVolumeModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(BillRunVolumeModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      let testBillRun

      beforeEach(async () => {
        testBillRun = await BillRunHelper.add()

        const { id: billRunId } = testBillRun

        testRecord = await BillRunVolumeHelper.add({ billRunId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query().innerJoinRelated('billRun')

        expect(query).to.exist()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunVolumeModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).to.be.instanceOf(BillRunVolumeModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.billRun).to.be.an.instanceOf(BillRunModel)
        expect(result.billRun).to.equal(testBillRun)
      })
    })

    describe('when linking to charge reference', () => {
      let testChargeReference

      beforeEach(async () => {
        testChargeReference = await ChargeReferenceHelper.add()

        const { id: chargeReferenceId } = testChargeReference

        testRecord = await BillRunVolumeHelper.add({ chargeReferenceId })
      })

      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query().innerJoinRelated('chargeReference')

        expect(query).to.exist()
      })

      it('can eager load the charge reference', async () => {
        const result = await BillRunVolumeModel.query().findById(testRecord.id).withGraphFetched('chargeReference')

        expect(result).to.be.instanceOf(BillRunVolumeModel)
        expect(result.id).to.equal(testRecord.id)

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
