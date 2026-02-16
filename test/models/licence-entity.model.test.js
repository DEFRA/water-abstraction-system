'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserVerificationHelper = require('../support/helpers/user-verification.helper.js')
const UserVerificationModel = require('../../app/models/user-verification.model.js')

// Thing under test
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')

describe('Licence Entity model', () => {
  let testLicenceDocumentHeaders
  let testLicenceEntityRoles
  let testRecord
  let testUser
  let testUserVerifications

  before(async () => {
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

  after(async () => {
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

      expect(result).to.be.an.instanceOf(LicenceEntityModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence document headers', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('licenceDocumentHeaders')

        expect(query).to.exist()
      })

      it('can eager load the licence document headers', async () => {
        const result = await LicenceEntityModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeaders')

        expect(result).to.be.instanceOf(LicenceEntityModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentHeaders).to.be.an.array()
        expect(result.licenceDocumentHeaders[0]).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeaders).to.include(testLicenceDocumentHeaders[0])
        expect(result.licenceDocumentHeaders).to.include(testLicenceDocumentHeaders[1])
      })
    })

    describe('when linking to licence entity roles', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('licenceEntityRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence entity roles', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('licenceEntityRoles')

        expect(result).to.be.instanceOf(LicenceEntityModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEntityRoles).to.be.an.array()
        expect(result.licenceEntityRoles[0]).to.be.an.instanceOf(LicenceEntityRoleModel)
        expect(result.licenceEntityRoles).to.include(testLicenceEntityRoles[0])
        expect(result.licenceEntityRoles).to.include(testLicenceEntityRoles[1])
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).to.be.instanceOf(LicenceEntityModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })

    describe('when linking to user verifications', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityModel.query().innerJoinRelated('userVerifications')

        expect(query).to.exist()
      })

      it('can eager load the user verifications', async () => {
        const result = await LicenceEntityModel.query().findById(testRecord.id).withGraphFetched('userVerifications')

        expect(result).to.be.instanceOf(LicenceEntityModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.userVerifications).to.be.an.array()
        expect(result.userVerifications[0]).to.be.an.instanceOf(UserVerificationModel)
        expect(result.userVerifications).to.include(testUserVerifications[0])
        expect(result.userVerifications).to.include(testUserVerifications[1])
      })
    })
  })
})
