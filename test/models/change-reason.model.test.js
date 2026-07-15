// Test helpers
import ChangeReasonHelper from '../support/helpers/change-reason.helper.js'
import ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'

// Thing under test
import ChangeReasonModel from '../../app/models/change-reason.model.js'

const CHANGE_REASON_SUCCESSION_REMAINDER_INDEX = 9

describe('Change Reason model', () => {
  let testChargeVersions
  let testRecord

  beforeAll(async () => {
    testRecord = ChangeReasonHelper.select(CHANGE_REASON_SUCCESSION_REMAINDER_INDEX)

    // Link charge versions
    testChargeVersions = []
    for (let i = 0; i < 2; i++) {
      const chargeVersion = await ChargeVersionHelper.add({ changeReasonId: testRecord.id })

      testChargeVersions.push(chargeVersion)
    }
  })

  afterAll(async () => {
    for (const chargeVersion of testChargeVersions) {
      await chargeVersion.$query().delete()
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChangeReasonModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChangeReasonModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge versions', () => {
      it('can successfully run a related query', async () => {
        const query = await ChangeReasonModel.query().innerJoinRelated('chargeVersions')

        expect(query).toBeDefined()
      })

      it('can eager load the charge versions', async () => {
        const result = await ChangeReasonModel.query().findById(testRecord.id).withGraphFetched('chargeVersions')

        expect(result).toBeInstanceOf(ChangeReasonModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersions).toBeInstanceOf(Array)
        expect(result.chargeVersions[0]).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersions).toContainEqual(testChargeVersions[0])
        expect(result.chargeVersions).toContainEqual(testChargeVersions[1])
      })
    })
  })
})
