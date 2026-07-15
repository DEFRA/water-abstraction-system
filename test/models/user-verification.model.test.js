// Test helpers
import * as LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import * as LicenceEntityHelper from '../support/helpers/licence-entity.helper.js'
import * as UserVerificationDocumentHelper from '../support/helpers/user-verification-document.helper.js'
import * as UserVerificationHelper from '../support/helpers/user-verification.helper.js'
import LicenceDocumentHeaderModel from '../../app/models/licence-document-header.model.js'
import LicenceEntityModel from '../../app/models/licence-entity.model.js'

// Thing under test
import UserVerificationModel from '../../app/models/user-verification.model.js'

describe('User Verification model', () => {
  let testLicenceDocumentHeaders
  let testUserVerificationDocuments
  let testCompanyEntity
  let testLicenceEntity
  let testRecord

  beforeAll(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceEntity = await LicenceEntityHelper.add()
    testLicenceDocumentHeaders = []
    for (let i = 0; i < 2; i++) {
      const testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add()

      testLicenceDocumentHeaders.push(testLicenceDocumentHeader)
    }

    testRecord = await UserVerificationHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id
    })

    testUserVerificationDocuments = []
    for (const testLicenceDocumentHeader of testLicenceDocumentHeaders) {
      const testUserVerificationDocument = await UserVerificationDocumentHelper.add({
        licenceDocumentHeaderId: testLicenceDocumentHeader.id,
        userVerificationId: testRecord.id
      })

      testUserVerificationDocuments.push(testUserVerificationDocument)
    }
  })

  afterAll(async () => {
    for (const testUserVerificationDocument of testUserVerificationDocuments) {
      await testUserVerificationDocument.$query().delete()
    }
    await testRecord.$query().delete()
    for (const testLicenceDocumentHeader of testLicenceDocumentHeaders) {
      await testLicenceDocumentHeader.$query().delete()
    }
    await testLicenceEntity.$query().delete()
    await testCompanyEntity.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserVerificationModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(UserVerificationModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company entity', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('companyEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the company entity', async () => {
        const result = await UserVerificationModel.query().findById(testRecord.id).withGraphFetched('companyEntity')

        expect(result).toBeInstanceOf(UserVerificationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.companyEntity).toEqual(testCompanyEntity)
      })
    })

    describe('when linking to licence entity', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('licenceEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the licence entity', async () => {
        const result = await UserVerificationModel.query().findById(testRecord.id).withGraphFetched('licenceEntity')

        expect(result).toBeInstanceOf(UserVerificationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.licenceEntity).toEqual(testLicenceEntity)
      })
    })

    describe('when linking to licence document headers', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('licenceDocumentHeaders')

        expect(query).toBeInstanceOf(Array)
      })

      it('can eager load the licence document headers', async () => {
        const result = await UserVerificationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeaders')

        expect(result).toBeInstanceOf(UserVerificationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentHeaders).toBeInstanceOf(Array)
        expect(result.licenceDocumentHeaders[0]).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeaders).toContainEqual(testLicenceDocumentHeaders[0])
        expect(result.licenceDocumentHeaders).toContainEqual(testLicenceDocumentHeaders[1])
      })
    })
  })
})
