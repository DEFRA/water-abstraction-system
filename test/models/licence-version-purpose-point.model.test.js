// Test helpers
import * as LicenceVersionPurposeHelper from '../support/helpers/licence-version-purpose.helper.js'
import LicenceVersionPurposeModel from '../../app/models/licence-version-purpose.model.js'
import * as LicenceVersionPurposePointHelper from '../support/helpers/licence-version-purpose-point.helper.js'
import * as PointHelper from '../support/helpers/point.helper.js'
import PointModel from '../../app/models/point.model.js'

// Thing under test
import LicenceVersionPurposePointModel from '../../app/models/licence-version-purpose-point.model.js'

describe('Licence Version Purpose Point model', () => {
  let testLicenceVersionPurpose
  let testPoint
  let testRecord

  beforeAll(async () => {
    testLicenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    testPoint = await PointHelper.add()

    testRecord = await LicenceVersionPurposePointHelper.add({
      licenceVersionPurposeId: testLicenceVersionPurpose.id,
      pointId: testPoint.id
    })
  })

  afterAll(async () => {
    await testLicenceVersionPurpose.$query().delete()
    await testPoint.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceVersionPurposePointModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceVersionPurposePointModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence version purpose', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposePointModel.query().innerJoinRelated('licenceVersionPurpose')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version purpose', async () => {
        const result = await LicenceVersionPurposePointModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceVersionPurpose')

        expect(result).toBeInstanceOf(LicenceVersionPurposePointModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersionPurpose).toBeInstanceOf(LicenceVersionPurposeModel)
        expect(result.licenceVersionPurpose).toEqual(testLicenceVersionPurpose)
      })
    })

    describe('when linking to point', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceVersionPurposePointModel.query().innerJoinRelated('point')

        expect(query).toBeDefined()
      })

      it('can eager load the point', async () => {
        const result = await LicenceVersionPurposePointModel.query().findById(testRecord.id).withGraphFetched('point')

        expect(result).toBeInstanceOf(LicenceVersionPurposePointModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.point).toBeInstanceOf(PointModel)
        expect(result.point).toEqual(testPoint)
      })
    })
  })
})
