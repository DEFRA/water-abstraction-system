// Test helpers
import * as BillHelper from '../support/helpers/bill.helper.js'
import BillModel from '../../app/models/bill.model.js'
import * as BillRunHelper from '../support/helpers/bill-run.helper.js'
import * as BillRunVolumeHelper from '../support/helpers/bill-run-volume.helper.js'
import BillRunVolumeModel from '../../app/models/bill-run-volume.model.js'
import * as RegionHelper from '../support/helpers/region.helper.js'
import RegionModel from '../../app/models/region.model.js'
import * as ReviewLicenceHelper from '../support/helpers/review-licence.helper.js'
import ReviewLicenceModel from '../../app/models/review-licence.model.js'

// Thing under test
import BillRunModel from '../../app/models/bill-run.model.js'

describe('Bill Run model', () => {
  let testBillRunVolumes
  let testBills
  let testRecord
  let testRegion
  let testReviewLicences

  beforeAll(async () => {
    // Link regions
    testRegion = RegionHelper.select()

    // Test record
    testRecord = await BillRunHelper.add({ regionId: testRegion.id })

    // Link bills
    testBills = []
    for (let i = 0; i < 2; i++) {
      const bill = await BillHelper.add({ financialYearEnding: 2023, billRunId: testRecord.id })

      testBills.push(bill)
    }

    // Link to bill run volumes
    testBillRunVolumes = []
    for (let i = 0; i < 2; i++) {
      const billRunVolume = await BillRunVolumeHelper.add({ billRunId: testRecord.id })

      testBillRunVolumes.push(billRunVolume)
    }

    // Link to review licences
    testReviewLicences = []
    for (let i = 0; i < 2; i++) {
      const reviewLicence = await ReviewLicenceHelper.add({ billRunId: testRecord.id })

      testReviewLicences.push(reviewLicence)
    }
  })

  afterAll(async () => {
    for (const bill of testBills) {
      await bill.$query().delete()
    }

    for (const billRunVolume of testBillRunVolumes) {
      await billRunVolume.$query().delete()
    }

    for (const reviewLicence of testReviewLicences) {
      await reviewLicence.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await BillRunModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(BillRunModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to region', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('region')

        expect(query).toBeDefined()
      })

      it('can eager load the region', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('region')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.region).toBeInstanceOf(RegionModel)
        expect(result.region).toMatchObject(testRegion)
      })
    })

    describe('when linking to bills', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('bills')

        expect(query).toBeDefined()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('bills')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.bills).toBeInstanceOf(Array)
        expect(result.bills[0]).toBeInstanceOf(BillModel)
        expect(result.bills).toContainEqual(testBills[0])
        expect(result.bills).toContainEqual(testBills[1])
      })
    })

    describe('when linking to bill run volumes', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('billRunVolumes')

        expect(query).toBeDefined()
      })

      it('can eager load the bills', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('billRunVolumes')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.billRunVolumes).toBeInstanceOf(Array)
        expect(result.billRunVolumes[0]).toBeInstanceOf(BillRunVolumeModel)
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[0])
        expect(result.billRunVolumes).toContainEqual(testBillRunVolumes[1])
      })
    })

    describe('when linking to review Licences', () => {
      it('can successfully run a related query', async () => {
        const query = await BillRunModel.query().innerJoinRelated('reviewLicences')

        expect(query).toBeDefined()
      })

      it('can eager load the review licences', async () => {
        const result = await BillRunModel.query().findById(testRecord.id).withGraphFetched('reviewLicences')

        expect(result).toBeInstanceOf(BillRunModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.reviewLicences).toBeInstanceOf(Array)
        expect(result.reviewLicences[0]).toBeInstanceOf(ReviewLicenceModel)
        expect(result.reviewLicences).toContainEqual(testReviewLicences[0])
        expect(result.reviewLicences).toContainEqual(testReviewLicences[1])
      })
    })
  })

  describe('Static getters', () => {
    describe('Error codes', () => {
      it('returns the requested error code', async () => {
        const result = BillRunModel.errorCodes.failedToCreateBillRun

        expect(result).toEqual(50)
      })
    })
  })
})
