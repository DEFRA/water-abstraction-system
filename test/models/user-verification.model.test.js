'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')
const UserVerificationDocumentHelper = require('../support/helpers/user-verification-document.helper.js')
const UserVerificationHelper = require('../support/helpers/user-verification.helper.js')

// Thing under test
const UserVerificationModel = require('../../app/models/user-verification.model.js')

describe('User Verification model', () => {
  let testLicenceDocumentHeaders
  let testUserVerificationDocuments
  let testCompanyEntity
  let testLicenceEntity
  let testRecord

  before(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceEntity = await LicenceEntityHelper.add()
    testLicenceDocumentHeaders = []
    for (let i = 0; i < 2; i++) {
      const licenceDocumentHeader = await LicenceDocumentHeaderHelper.add()

      testLicenceDocumentHeaders.push(licenceDocumentHeader)
    }

    testRecord = await UserVerificationHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id
    })

    testUserVerificationDocuments = []
    for (const licenceDocumentHeader of testLicenceDocumentHeaders) {
      const userVerificationDocument = await UserVerificationDocumentHelper.add({
        licenceDocumentHeaderId: licenceDocumentHeader.id,
        userVerificationId: testRecord.id
      })

      testUserVerificationDocuments.push(userVerificationDocument)
    }
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserVerificationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(UserVerificationModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company entity', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('companyEntity')

        expect(query).to.exist()
      })

      it('can eager load the company entity', async () => {
        const result = await UserVerificationModel.query().findById(testRecord.id).withGraphFetched('companyEntity')

        expect(result).to.be.instanceOf(UserVerificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.companyEntity).to.equal(testCompanyEntity)
      })
    })

    describe('when linking to licence entity', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('licenceEntity')

        expect(query).to.exist()
      })

      it('can eager load the licence entity', async () => {
        const result = await UserVerificationModel.query().findById(testRecord.id).withGraphFetched('licenceEntity')

        expect(result).to.be.instanceOf(UserVerificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.licenceEntity).to.equal(testLicenceEntity)
      })
    })

    describe('when linking to licence document headers', () => {
      it('can successfully run a related query', async () => {
        const query = await UserVerificationModel.query().innerJoinRelated('licenceDocumentHeaders')

        expect(query).to.be.an.array()
      })

      it('can eager load the licence document headers', async () => {
        const result = await UserVerificationModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeaders')

        expect(result).to.be.instanceOf(UserVerificationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentHeaders).to.be.an.array()
        expect(result.licenceDocumentHeaders[0]).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeaders).to.include(testLicenceDocumentHeaders[0])
        expect(result.licenceDocumentHeaders).to.include(testLicenceDocumentHeaders[1])
      })
    })
  })
})
