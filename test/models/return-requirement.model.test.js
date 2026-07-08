// Test helpers
import * as PointHelper from '../support/helpers/point.helper.js'
import PointModel from '../../app/models/point.model.js'
import * as ReturnLogHelper from '../support/helpers/return-log.helper.js'
import ReturnLogModel from '../../app/models/return-log.model.js'
import * as ReturnRequirementHelper from '../support/helpers/return-requirement.helper.js'
import * as ReturnRequirementPointHelper from '../support/helpers/return-requirement-point.helper.js'
import * as ReturnRequirementPurposeHelper from '../support/helpers/return-requirement-purpose.helper.js'
import ReturnRequirementPurposeModel from '../../app/models/return-requirement-purpose.model.js'
import * as ReturnVersionHelper from '../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../app/models/return-version.model.js'

// Thing under test
import ReturnRequirementModel from '../../app/models/return-requirement.model.js'

describe('Return Requirement model', () => {
  let testPoint
  let testRecord
  let testReturnLogs
  let testReturnRequirementPurposes
  let testReturnVersion

  beforeAll(async () => {
    testReturnVersion = await ReturnVersionHelper.add()

    testRecord = await ReturnRequirementHelper.add({ returnVersionId: testReturnVersion.id })

    testPoint = await PointHelper.add()
    await ReturnRequirementPointHelper.add({ pointId: testPoint.id, returnRequirementId: testRecord.id })

    testReturnRequirementPurposes = []
    for (let i = 0; i < 2; i++) {
      const returnRequirementPurpose = await ReturnRequirementPurposeHelper.add({
        alias: `TEST RET REQ ${i}`,
        returnRequirementId: testRecord.id
      })

      testReturnRequirementPurposes.push(returnRequirementPurpose)
    }

    testReturnLogs = []
    for (let i = 0; i < 2; i++) {
      const returnLog = await ReturnLogHelper.add({ returnRequirementId: testRecord.id })

      testReturnLogs.push(returnLog)
    }
  })

  afterAll(async () => {
    await testReturnVersion.$query().delete()
    await testPoint.$query().delete()

    for (const returnRequirementPurpose of testReturnRequirementPurposes) {
      await returnRequirementPurpose.$query().delete()
    }

    for (const returnLog of testReturnLogs) {
      await returnLog.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ReturnRequirementModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ReturnRequirementModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking through return requirement points to points', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('points')

        expect(query).toBeDefined()
      })

      it('can eager load the points', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('points')

        expect(result).toBeInstanceOf(ReturnRequirementModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.points).toBeInstanceOf(Array)
        expect(result.points).toHaveLength(1)
        expect(result.points[0]).toBeInstanceOf(PointModel)
        expect(result.points[0]).toMatchObject(testPoint)
      })
    })

    describe('when linking to return logs', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnLogs')

        expect(query).toBeDefined()
      })

      it('can eager load the return logs', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('returnLogs')

        expect(result).toBeInstanceOf(ReturnRequirementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnLogs).toBeInstanceOf(Array)
        expect(result.returnLogs[0]).toBeInstanceOf(ReturnLogModel)
        expect(result.returnLogs).toContainEqual(testReturnLogs[0])
        expect(result.returnLogs).toContainEqual(testReturnLogs[1])
      })
    })

    describe('when linking to return requirement purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnRequirementPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirement purposes', async () => {
        const result = await ReturnRequirementModel.query()
          .findById(testRecord.id)
          .withGraphFetched('returnRequirementPurposes')

        expect(result).toBeInstanceOf(ReturnRequirementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnRequirementPurposes).toBeInstanceOf(Array)
        expect(result.returnRequirementPurposes[0]).toBeInstanceOf(ReturnRequirementPurposeModel)
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[0])
        expect(result.returnRequirementPurposes).toContainEqual(testReturnRequirementPurposes[1])
      })
    })

    describe('when linking to return version', () => {
      it('can successfully run a related query', async () => {
        const query = await ReturnRequirementModel.query().innerJoinRelated('returnVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await ReturnRequirementModel.query().findById(testRecord.id).withGraphFetched('returnVersion')

        expect(result).toBeInstanceOf(ReturnRequirementModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnVersion).toBeInstanceOf(ReturnVersionModel)
        expect(result.returnVersion).toEqual(testReturnVersion)
      })
    })
  })
})
