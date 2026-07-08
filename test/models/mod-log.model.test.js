// Test helpers
import * as ChargeVersionHelper from '../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../app/models/charge-version.model.js'
import * as LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'
import * as LicenceVersionHelper from '../support/helpers/licence-version.helper.js'
import LicenceVersionModel from '../../app/models/licence-version.model.js'
import * as ReturnVersionHelper from '../support/helpers/return-version.helper.js'
import ReturnVersionModel from '../../app/models/return-version.model.js'
import * as ModLogHelper from '../support/helpers/mod-log.helper.js'

// Thing under test
import ModLogModel from '../../app/models/mod-log.model.js'

describe('Mod Log model', () => {
  let testChargeVersion
  let testLicence
  let testLicenceVersion
  let testRecord
  let testReturnVersion

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()
    testChargeVersion = await ChargeVersionHelper.add({
      licenceId: testLicence.id,
      licenceRef: testLicence.licenceRef
    })
    testLicenceVersion = await LicenceVersionHelper.add({ licenceId: testLicence.id })
    testReturnVersion = await ReturnVersionHelper.add({ licenceId: testLicence.id })

    // NOTE: A mod log would be linked to a licence and _one_ of the version types. It would not be linked to all 3.
    // But for the purposes of testing we have have correctly set up the relationships between them it is perfectly
    // fine to reference all version types in the one mod log record.
    testRecord = await ModLogHelper.add({
      chargeVersionId: testChargeVersion.id,
      licenceId: testLicence.id,
      licenceRef: testLicence.licenceRef,
      licenceVersionId: testLicenceVersion.id,
      returnVersionId: testReturnVersion.id
    })
  })

  afterAll(async () => {
    await testLicence.$query().delete()
    await testChargeVersion.$query().delete()
    await testLicenceVersion.$query().delete()
    await testReturnVersion.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ModLogModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ModLogModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query().innerJoinRelated('chargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await ModLogModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(ModLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })

    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await ModLogModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(ModLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to licence version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query().innerJoinRelated('licenceVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the licence version', async () => {
        const result = await ModLogModel.query().findById(testRecord.id).withGraphFetched('licenceVersion')

        expect(result).toBeInstanceOf(ModLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceVersion).toBeInstanceOf(LicenceVersionModel)
        expect(result.licenceVersion).toEqual(testLicenceVersion)
      })
    })

    describe('when linking to return version', () => {
      it('can successfully run a related query', async () => {
        const query = await ModLogModel.query().innerJoinRelated('returnVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the return version', async () => {
        const result = await ModLogModel.query().findById(testRecord.id).withGraphFetched('returnVersion')

        expect(result).toBeInstanceOf(ModLogModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.returnVersion).toBeInstanceOf(ReturnVersionModel)
        expect(result.returnVersion).toEqual(testReturnVersion)
      })
    })
  })
})
