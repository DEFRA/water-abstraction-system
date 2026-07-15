// Test helpers
import * as LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import * as LicenceEntityRoleHelper from '../support/helpers/licence-entity-role.helper.js'
import * as LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceEntityRoleModel from '../../app/models/licence-entity-role.model.js'
import LicenceModel from '../../app/models/licence.model.js'

// Thing under test
import LicenceDocumentHeaderModel from '../../app/models/licence-document-header.model.js'

describe('Licence Document Header model', () => {
  let testLicenceEntityRole
  let testLicence
  let testRecord

  beforeAll(async () => {
    testLicenceEntityRole = await LicenceEntityRoleHelper.add()
    testLicence = await LicenceHelper.add()

    testRecord = await LicenceDocumentHeaderHelper.add({
      companyEntityId: testLicenceEntityRole.companyEntityId,
      licenceRef: testLicence.licenceRef
    })
  })

  afterAll(async () => {
    await testLicenceEntityRole.$query().delete()
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceDocumentHeaderModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentHeaderModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to licence entity roles', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentHeaderModel.query().innerJoinRelated('licenceEntityRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence entity roles', async () => {
        const result = await LicenceDocumentHeaderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceEntityRoles')

        expect(result).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.id).toEqual(testRecord.id)

        const [licenceEntityRole] = result.licenceEntityRoles

        expect(licenceEntityRole).toBeInstanceOf(LicenceEntityRoleModel)
        expect(licenceEntityRole).toEqual(testLicenceEntityRole)
      })
    })
  })
})
