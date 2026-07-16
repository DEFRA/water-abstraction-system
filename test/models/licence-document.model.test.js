// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceDocumentHelper from '../support/helpers/licence-document.helper.js'
import LicenceDocumentRoleHelper from '../support/helpers/licence-document-role.helper.js'
import LicenceDocumentRoleModel from '../../app/models/licence-document-role.model.js'
import LicenceHelper from '../support/helpers/licence.helper.js'
import LicenceModel from '../../app/models/licence.model.js'

// Thing under test
import LicenceDocumentModel from '../../app/models/licence-document.model.js'

describe('Licence Document model', () => {
  let testLicence
  let testLicenceDocumentRoles
  let testRecord

  beforeAll(async () => {
    // Link to licence
    testLicence = await LicenceHelper.add()

    // Test record
    testRecord = await LicenceDocumentHelper.add({ licenceRef: testLicence.licenceRef })

    // Link to licence document roles
    testLicenceDocumentRoles = []
    for (let i = 0; i < 2; i++) {
      const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ licenceDocumentId: testRecord.id })

      testLicenceDocumentRoles.push(licenceDocumentRole)
    }
  })

  afterAll(async () => {
    await testLicence.$query().delete()

    for (const licenceDocumentRole of testLicenceDocumentRoles) {
      await licenceDocumentRole.$query().delete()
    }

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceDocumentModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceDocumentModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceDocumentModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to licence document roles', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentModel.query().innerJoinRelated('licenceDocumentRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document roles', async () => {
        const result = await LicenceDocumentModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentRoles')

        expect(result).toBeInstanceOf(LicenceDocumentModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentRoles).toBeInstanceOf(Array)
        expect(result.licenceDocumentRoles[0]).toBeInstanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).toContainEqual(testLicenceDocumentRoles[1])
      })
    })
  })
})
