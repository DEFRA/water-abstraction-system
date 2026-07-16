// Test framework
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import LicenceVersionPurposeHelper from '../support/helpers/licence-version-purpose.helper.js'
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'
import LicenceVersionPurposePointHelper from '../support/helpers/licence-version-purpose-point.helper.js'
import PointHelper from '../support/helpers/point.helper.js'
import ReturnRequirementHelper from '../support/helpers/return-requirement.helper.js'
import ReturnRequirementModel from '../../app/models/return-requirement.model.js'
import ReturnRequirementPointHelper from '../support/helpers/return-requirement-point.helper.js'
import SourceHelper from '../support/helpers/source.helper.js'
import SourceModel from '../../app/models/source.model.js'

// Thing under test
import PointModel from '../../app/models/point.model.js'

describe('Point model', () => {
  let testLicenceVersionPurpose
  let testRecord
  let testReturnRequirement
  let testSource

  beforeAll(async () => {
    testSource = SourceHelper.select()
    testRecord = await PointHelper.add({ sourceId: testSource.id })

    testReturnRequirement = await ReturnRequirementHelper.add()
    await ReturnRequirementPointHelper.add({
      pointId: testRecord.id,
      returnRequirementId: testReturnRequirement.id
    })

    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    await LicenceVersionPurposePointHelper.add({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      pointId: testRecord.id
    })
  })

  afterAll(async () => {
    await testReturnRequirement.$query().delete()
    await testLicenceVersionPurpose.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await PointModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(PointModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking through licence version purpose points to licence version purposes', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query().innerJoinRelated('licenceVersionPurposes')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purposes', async () => {
        const result = await PointModel.query().findById(testRecord.id).withGraphFetched('licenceVersionPurposes')

        expect(result).toBeInstanceOf(PointModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.licenceVersionPurposes).toBeInstanceOf(Array)
        expect(result.licenceVersionPurposes).toHaveLength(1)
        expect(result.licenceVersionPurposes[0]).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurposes[0]).toMatchObject(testLicenceVersionPurpose)
      })
    })

    describe('when linking through return requirement points to return requirements', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query().innerJoinRelated('returnRequirements')

        expect(query).toBeDefined()
      })

      it('can eager load the return requirements', async () => {
        const result = await PointModel.query().findById(testRecord.id).withGraphFetched('returnRequirements')

        expect(result).toBeInstanceOf(PointModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.returnRequirements).toBeInstanceOf(Array)
        expect(result.returnRequirements).toHaveLength(1)
        expect(result.returnRequirements[0]).toBeInstanceOf(ReturnRequirementModel)
        expect(result.returnRequirements[0]).toMatchObject(testReturnRequirement)
      })
    })

    describe('when linking to source', () => {
      it('can successfully run a related query', async () => {
        const query = await PointModel.query().innerJoinRelated('source')

        expect(query).toBeDefined()
      })

      it('can eager load the source', async () => {
        const result = await PointModel.query().findById(testRecord.id).withGraphFetched('source')

        expect(result).toBeInstanceOf(PointModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.source).toBeInstanceOf(SourceModel)
        expect(result.source).toMatchObject(testSource)
      })
    })
  })

  describe('$describe', () => {
    let pointTestRecord

    describe('when the instance represents a "point" (1 grid reference)', () => {
      beforeEach(() => {
        pointTestRecord = PointModel.fromJson({ ngr1: 'ST 58212 72697' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          pointTestRecord.description = 'Head office'
        })

        it('returns a "point" description including the supplementary', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual('At National Grid Reference ST 58212 72697 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "point" description', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual('At National Grid Reference ST 58212 72697')
        })
      })
    })

    describe('when the instance represents a "reach" (2 grid references)', () => {
      beforeEach(() => {
        pointTestRecord = PointModel.fromJson({ ngr1: 'ST 58212 72697', ngr2: 'ST 58151 72683' })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          pointTestRecord.description = 'Head office'
        })

        it('returns a "reach" description including the supplementary', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual('Between National Grid References ST 58212 72697 and ST 58151 72683 (Head office)')
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "reach" description', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual('Between National Grid References ST 58212 72697 and ST 58151 72683')
        })
      })
    })

    describe('when the instance represents an "area" (4 grid references)', () => {
      beforeEach(() => {
        pointTestRecord = PointModel.fromJson({
          ngr1: 'ST 58212 72697',
          ngr2: 'ST 58151 72683',
          ngr3: 'ST 58145 72727',
          ngr4: 'ST 58222 72744'
        })
      })

      describe('and it has a supplementary description', () => {
        beforeEach(() => {
          pointTestRecord.description = 'Head office'
        })

        it('returns an "area" description including the supplementary', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual(
            'Within the area formed by the straight lines running between National Grid References ST 58212 72697, ST 58151 72683, ST 58145 72727 and ST 58222 72744 (Head office)'
          )
        })
      })

      describe('and it does not have a supplementary description', () => {
        it('returns just the "area" description', () => {
          const result = pointTestRecord.$describe()

          expect(result).toEqual(
            'Within the area formed by the straight lines running between National Grid References ST 58212 72697, ST 58151 72683, ST 58145 72727 and ST 58222 72744'
          )
        })
      })
    })
  })
})
