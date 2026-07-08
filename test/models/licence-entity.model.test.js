// Test helpers
import * as LicenceDocumentHeaderHelper from '../support/helpers/licence-document-header.helper.js'
import LicenceDocumentHeaderModel from '../../app/models/licence-document-header.model.js'
import * as LicenceEntityHelper from '../support/helpers/licence-entity.helper.js'
import * as LicenceEntityRoleHelper from '../support/helpers/licence-entity-role.helper.js'
import LicenceEntityRoleModel from '../../app/models/licence-entity-role.model.js'
import * as UserHelper from '../support/helpers/user.helper.js'
import UserModel from '../../app/models/user.model.js'
import * as UserVerificationHelper from '../support/helpers/user-verification.helper.js'
import UserVerificationModel from '../../app/models/user-verification.model.js'

// Thing under test
import LicenceEntityModel from '../../app/models/licence-entity.model.js'

describe('Licence Entity model', () => {
  let testLicenceDocumentHeaders
  let testLicenceEntityRoles
  let testRecord
  let testUser
  let testUserVerifications

  beforeAll(async () => {
    testRecord = await LicenceEntityHelper.add()

    const { id: licenceEntityId } = testRecord

    testLicenceDocumentHeaders = []
    for (let i = 0; i < 2; i++) {
      const testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ companyEntityId: licenceEntityId })

      testLicenceDocumentHeaders.push(testLicenceDocumentHeader)
    }

    testLicenceEntityRoles = []
    for (let i = 0; i < 2; i++) {
      const testLicenceEntityRole = await LicenceEntityRoleHelper.add({ licenceEntityId })

      testLicenceEntityRoles.push(testLicenceEntityRole)
    }

    testUser = await UserHelper.add({ licenceEntityId })

    testUserVerifications = []
    for (let i = 0; i < 2; i++) {
      const testUserVerification = await UserVerificationHelper.add({ licenceEntityId })

      testUserVerifications.push(testUserVerification)
    }
  })

  afterAll(async () => {
    for (const testUserVerification of testUserVerifications) {
      await testUserVerification.$query().delete()
    }
    await testUser.$query().delete()
    for (const testLicenceEntityRole of testLicenceEntityRoles) {
      await testLicenceEntityRole.$query().delete()
    }
    for (const testLicenceDocumentHeader of testLicenceDocumentHeaders) {
      await testLicenceDocumentHeader.$query().delete()
    }
    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceEntityModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence document headers', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('licenceDocumentHeaders')

        expect(query).toBeDefined()
      })

      it('can eager load the licence document headers', async () => {
        const result = await LicenceEntityModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeaders')

        expect(result).toBeInstanceOf(LicenceEntityModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceDocumentHeaders).toBeInstanceOf(Array)
        expect(result.licenceDocumentHeaders[0]).toBeInstanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeaders).toContainEqual(testLicenceDocumentHeaders[0])
        expect(result.licenceDocumentHeaders).toContainEqual(testLicenceDocumentHeaders[1])
      })
    })

    describe('when linking to licence entity roles', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('licenceEntityRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the licence entity roles', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('licenceEntityRoles')

        expect(result).toBeInstanceOf(LicenceEntityModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceEntityRoles).toBeInstanceOf(Array)
        expect(result.licenceEntityRoles[0]).toBeInstanceOf(LicenceEntityRoleModel)
        expect(result.licenceEntityRoles).toContainEqual(testLicenceEntityRoles[0])
        expect(result.licenceEntityRoles).toContainEqual(testLicenceEntityRoles[1])
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(LicenceEntityModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toEqual(testUser)
      })
    })

    describe('when linking to user verifications', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('userVerifications')

        expect(query).toBeDefined()
      })

      it('can eager load the user verifications', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('userVerifications')

        expect(result).toBeInstanceOf(LicenceEntityModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.userVerifications).toBeInstanceOf(Array)
        expect(result.userVerifications[0]).toBeInstanceOf(UserVerificationModel)
        expect(result.userVerifications).toContainEqual(testUserVerifications[0])
        expect(result.userVerifications).toContainEqual(testUserVerifications[1])
      })
    })
  })
})
