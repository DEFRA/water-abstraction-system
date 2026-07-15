// Test helpers
import LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionModel from '../../app/models/licence-version.model.js'
import LicenceVersionPurposeConditionHelper from '../support/helpers/licence-version-purpose-condition.helper.js'
import LicenceVersionPurposeConditionModel from '../../app/models/licence-version-purpose-condition.model.js'
import LicenceVersionPurposeHelper from '../support/helpers/licence-version-purpose.helper.js'
import LicenceVersionPurposePointHelper from '../support/helpers/licence-version-purpose-point.helper.js'
import LicenceVersionPurposePointModel from '../../app/models/licence-version-purpose-point.model.js'
import PointHelper from '../support/helpers/point.helper.js'
import PointModel from '../../app/models/point.model.js'
import PrimaryPurposeHelper from '../support/helpers/primary-purpose.helper.js'
import PrimaryPurposeModel from '../../app/models/primary-purpose.model.js'
import PurposeHelper from '../support/helpers/purpose.helper.js'
import PurposeModel from '../../app/models/purpose.model.js'
import SecondaryPurposeHelper from '../support/helpers/secondary-purpose.helper.js'
import SecondaryPurposeModel from '../../app/models/secondary-purpose.model.js'

// Thing under test
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'

describe('Licence Version Purpose model', () => {
  let primaryPurposeId
  let purposeId
  let secondaryPurposeId

  let testLicenceVersion
  let testLicenceVersionPurposeConditions
  let testLicenceVersionPurposePoints
  let testPoint
  let testRecord

  beforeAll(async () => {
    primaryPurposeId = PrimaryPurposeHelper.select().id
    secondaryPurposeId = SecondaryPurposeHelper.select().id
    purposeId = PurposeHelper.select().id

    testLicenceVersion = await LicenceVersionHelper.add()

    testRecord = await LicenceVersionPurposeHelper.add({
      licenceVersionId: testLicenceVersion.id,
      primaryPurposeId,
      purposeId,
      secondaryPurposeId
    })

    testPoint = await PointHelper.add()
    await LicenceVersionPurposePointHelper.add({ licenceVersionPurposeId: testRecord.id, pointId: testPoint.id })

    testLicenceVersionPurposeConditions = []
    testLicenceVersionPurposePoints = []

    for (let i = 0; i < 2; i++) {
      const licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeId: testRecord.id
      })

      const licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: testRecord.id
      })

      testLicenceVersionPurposeConditions.push(licenceVersionPurposeCondition)
      testLicenceVersionPurposePoints.push(licenceVersionPurposePoint)
    }
  })

  afterAll(async () => {
    await testLicenceVersion.$query().delete()
    await testPoint.$query().delete()

    for (const licenceVersionPurposeCondition of testLicenceVersionPurposeConditions) {
      await licenceVersionPurposeCondition.$query().delete()
    }

    for (const licenceVersionPurposePoint of testLicenceVersionPurposePoints) {
      await licenceVersionPurposePoint.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposeModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('licenceVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersion')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersion).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersion.id).toEqual(testLicenceVersion.id)
      })
    })

    describe('when linking to licence version purpose conditions', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('licenceVersionPurposeConditions')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose conditions', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposeConditions')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurposeConditions).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposeConditions[0]).toBeInstanceOf(LicenceVersionPurposeConditionModel)
        expect(result.licenceVersionPurposeConditions).toContainEqual(testLicenceVersionPurposeConditions[0])
        expect(result.licenceVersionPurposeConditions).toContainEqual(testLicenceVersionPurposeConditions[1])
      })
    })

    describe('when linking to licence version purpose points', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('licenceVersionPurposePoints')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose points', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurposePoints')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurposePoints).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposePoints[0]).toBeInstanceOf(LicenceVersionPurposePointModel)
        expect(result.licenceVersionPurposePoints).toContainEqual(testLicenceVersionPurposePoints[0])
        expect(result.licenceVersionPurposePoints).toContainEqual(testLicenceVersionPurposePoints[1])
      })
    })

    describe('when linking through licence version purpose points to points', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('points')

        expect(query).toBeDefined()
      })

      it('can eager load the points', async () => {
        const result = await LicenceVersionPurposeModel.query().findById(testRecord.id).withGraphFetched('points')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.points).toBeInstanceOf(Array)
        expect(result.points).toHaveLength(1)
        expect(result.points[0]).toBeInstanceOf(PointModel)
        expect(result.points[0]).toMatchObject(testPoint)
      })
    })

    describe('when linking to primary purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('primaryPurpose')

        expect(query).toBeDefined()
      })

      it('can eager load the primary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('primaryPurpose')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.primaryPurpose).toBeInstanceOf(PrimaryPurposeModel)
        expect(result.primaryPurpose.id).toEqual(primaryPurposeId)
      })
    })

    describe('when linking to purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('purpose')

        expect(query).toBeDefined()
      })

      it('can eager load the purpose', async () => {
        const result = await LicenceVersionPurposeModel.query().findById(testRecord.id).withGraphFetched('purpose')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.purpose).toBeInstanceOf(PurposeModel)
        expect(result.purpose.id).toEqual(purposeId)
      })
    })

    describe('when linking to secondary purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposeModel.query().innerJoinRelated('secondaryPurpose')

        expect(query).toBeDefined()
      })

      it('can eager load the secondary purpose', async () => {
        const result = await LicenceVersionPurposeModel.query()
          .findById(testRecord.id)
          .withGraphFetched('secondaryPurpose')

        expect(result).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.secondaryPurpose).toBeInstanceOf(SecondaryPurposeModel)
        expect(result.secondaryPurpose.id).toEqual(secondaryPurposeId)
      })
    })
  })

  describe('$electricityGeneration', () => {
    describe('when instance has not been set with the additional properties needed', () => {
      beforeEach(async () => {
        testRecord = await LicenceVersionPurposeHelper.add()
      })

      it('throws an error', () => {
        expect(() => {
          return testRecord.$electricityGeneration()
        }).toThrow(TypeError)
      })
    })
  })

  describe('when the instance has been set with the additional properties needed', () => {
    let invalidPrimaryPurpose
    let invalidPurpose
    let invalidSecondaryPurpose

    let validPrimaryPurpose
    let validPurpose
    let validSecondaryPurpose

    beforeEach(() => {
      invalidPrimaryPurpose = PrimaryPurposeHelper.select(0)
      invalidSecondaryPurpose = SecondaryPurposeHelper.select(0)
      invalidPurpose = PurposeHelper.data.find((purpose) => {
        return purpose.legacyId === '400'
      })

      validPrimaryPurpose = PrimaryPurposeHelper.data.find((primaryPurpose) => {
        return primaryPurpose.legacyId === 'P'
      })
      validSecondaryPurpose = SecondaryPurposeHelper.data.find((secondaryPurpose) => {
        return secondaryPurpose.legacyId === 'ELC'
      })
      validPurpose = PurposeHelper.data.find((purpose) => {
        return purpose.legacyId === '200'
      })
    })

    describe('but the primary purpose is not "P" (Production Of Energy)', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: invalidPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).toBe(false)
      })
    })

    describe('but the secondary purpose is not "ELC" (Electricity)', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: invalidSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).toBe(false)
      })
    })

    describe('but the purpose is not "200" or "240"', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: invalidPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns false', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).toBe(false)
      })
    })

    describe('and the purpose plus primary and secondary purpose are all electricity generating', () => {
      beforeEach(async () => {
        const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
          primaryPurposeId: validPrimaryPurpose.id,
          secondaryPurposeId: validSecondaryPurpose.id,
          purposeId: validPurpose.id
        })

        testRecord = await LicenceVersionPurposeModel.query().findById(licenceVersionPurpose.id).modify('allPurposes')
      })

      it('returns true', () => {
        const result = testRecord.$electricityGeneration()

        expect(result).toBe(true)
      })
    })
  })
})
