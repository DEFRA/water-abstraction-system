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
const UserVerificationDocumentHelper = require('../support/helpers/user-verification-document.helper.js')
const UserVerificationHelper = require('../support/helpers/user-verification.helper.js')
const UserVerificationModel = require('../../app/models/user-verification.model.js')

// Thing under test
const UserVerificationDocumentModel = require('../../app/models/user-verification-document.model.js')

describe('User Verification Document model', () => {
  let testLicenceDocumentHeader
  let testCompanyEntity
  let testLicenceEntity
  let testUserVerification
  let testRecord

  before(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceEntity = await LicenceEntityHelper.add()
    testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add()

    testUserVerification = await UserVerificationHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id
    })

    testRecord = await UserVerificationDocumentHelper.add({
      licenceDocumentHeaderId: testLicenceDocumentHeader.id,
      userVerificationId: testUserVerification.id
    })
  })

  after(async () => {
    await testRecord.$query().delete()
    await testUserVerification.$query().delete()
    await testLicenceDocumentHeader.$query().delete()
    await testLicenceEntity.$query().delete()
    await testCompanyEntity.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserVerificationDocumentModel.query().findById([
        testRecord.userVerificationId,
        testRecord.licenceDocumentHeaderId
      ])

      expect(result).to.be.an.instanceOf(UserVerificationDocumentModel)
      expect(result.userVerificationId).to.equal(testRecord.userVerificationId)
      expect(result.licenceDocumentHeaderId).to.equal(testRecord.licenceDocumentHeaderId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence document header', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationDocumentModel.query().innerJoinRelated('licenceDocumentHeader')

        expect(query).to.exist()
      })

      it('can eager load the licence document header', async () => {
        const result = await UserVerificationDocumentModel.query()
          .findById([testRecord.userVerificationId, testRecord.licenceDocumentHeaderId])
          .withGraphFetched('licenceDocumentHeader')

        expect(result).to.be.instanceOf(UserVerificationDocumentModel)
        expect(result.userVerificationId).to.equal(testRecord.userVerificationId)
        expect(result.licenceDocumentHeaderId).to.equal(testRecord.licenceDocumentHeaderId)

        expect(result.licenceDocumentHeader).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).to.equal(testLicenceDocumentHeader)
      })
    })

    describe('when linking to user verification', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationDocumentModel.query().innerJoinRelated('userVerification')

        expect(query).to.exist()
      })

      it('can eager load the user verification', async () => {
        const result = await UserVerificationDocumentModel.query()
          .findById([testRecord.userVerificationId, testRecord.licenceDocumentHeaderId])
          .withGraphFetched('userVerification')

        expect(result).to.be.instanceOf(UserVerificationDocumentModel)
        expect(result.userVerificationId).to.equal(testRecord.userVerificationId)
        expect(result.licenceDocumentHeaderId).to.equal(testRecord.licenceDocumentHeaderId)

        expect(result.userVerification).to.be.an.instanceOf(UserVerificationModel)
        expect(result.userVerification).to.equal(testUserVerification)
      })
    })
  })
})
