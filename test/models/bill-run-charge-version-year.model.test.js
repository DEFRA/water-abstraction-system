// Test helpers
import BillRunChargeVersionYearHelper from '../support/helpers/bill-run-charge-version-year.helper.js'
import BillRunHelper from '../support/helpers/bill-run.helper.js'
import BillRunModel from '../../app/models/bill-run.model.js'
import ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'

// Thing under test
import BillRunChargeVersionYearModel from '../../app/models/bill-run-charge-version-year.model.js'

describe('Bill Run Charge Version Year model', () => {
  let testBillRun
  let testChargeVersion
  let testRecord

  beforeAll(async () => {
    // Link bill runs
    testBillRun = await BillRunHelper.add()

    // Link charge versions
    testChargeVersion = await ChargeVersionHelper.add()

    // Test record
    testRecord = await BillRunChargeVersionYearHelper.add({
      billRunId: testBillRun.id,
      chargeVersionId: testChargeVersion.id
    })
  })

  afterAll(async () => {
    await testBillRun.$query().delete()
    await testChargeVersion.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunChargeVersionYearModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillRunChargeVersionYearModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to bill run', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunChargeVersionYearModel.query().innerJoinRelated('billRun')

        expect(query).toBeDefined()
      })

      it('can eager load the bill run', async () => {
        const result = await BillRunChargeVersionYearModel.query().findById(testRecord.id).withGraphFetched('billRun')

        expect(result).toBeInstanceOf(BillRunChargeVersionYearModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRun).toBeInstanceOf(BillRunModel)
        expect(result.billRun).toEqual(testBillRun)
      })
    })

    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunChargeVersionYearModel.query().innerJoinRelated('chargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await BillRunChargeVersionYearModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(BillRunChargeVersionYearModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })
  })
})
