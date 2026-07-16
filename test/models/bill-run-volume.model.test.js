// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import BillRunHelper from '../support/helpers/bill-run.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import BillRunVolumeHelper from '../support/helpers/bill-run-volume.helper.js'
import ChargeReferenceHelper from '../support/helpers/charge-reference.helper.js'
import ChargeReferenceModel from '../../app/models/charge-reference.model.js'

// Thing under test
import BillRunVolumeModel from '../../app/models/bill-run-volume.model.js'

describe('Bill Run Volume model', () => {
  let testBillRun
  let testChargeReference
  let testRecord

  beforeAll(async () => {
    // Link bill runs
    testBillRun = await BillRunHelper.add()

    // Link charge references
    testChargeReference = await ChargeReferenceHelper.add()

    // Test record
    testRecord = await BillRunVolumeHelper.add({
      billRunId: testBillRun.id,
      chargeReferenceId: testChargeReference.id,
      twoPartTariffStatus: 90
    })
  })

  afterAll(async () => {
    await testBillRun.$query().delete()
    await testChargeReference.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunVolumeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillRunVolumeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query().innerJoinRelated('billRun')

        expect(query).toBeDefined()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunVolumeModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).toBeInstanceOf(BillRunVolumeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to charge reference', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunVolumeModel.query().innerJoinRelated('chargeReference')

        expect(query).toBeDefined()
      })

      it('can eager load the charge reference', async () => {
        const result = await BillRunVolumeModel.query().findById(testRecord.id).withGraphFetched('chargeReference')

        expect(result).toBeInstanceOf(BillRunVolumeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeReference).toBeInstanceOf(ChargeReferenceModel)
        expect(result.chargeReference).toEqual(testChargeReference)
      })
    })
  })

  describe('Static getters', () => {
    describe('Two Part Tariff status codes', () => {
      it('returns the requested status code', async () => {
        const result = BillRunVolumeModel.twoPartTariffStatuses.noReturnsSubmitted

        expect(result).toEqual(10)
      })
    })
  })

  describe('$twoPartTariffStatus', () => {
    describe('when the two-part tariff status is set', () => {
      it('returns the status', () => {
        const result = testRecord.$twoPartTariffStatus()

        expect(result).toEqual('returnLineOverlapsChargePeriod')
      })
    })

    describe('when the two-part tariff status is not set', () => {
      beforeAll(async () => {
        testRecord = await BillRunVolumeHelper.add()
      })

      it('returns null', () => {
        const result = testRecord.$twoPartTariffStatus()

        expect(result).toBeNull()
      })
    })
  })
})
