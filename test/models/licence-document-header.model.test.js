'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, before } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceDocumentHeaderHelper = require('../support/helpers/licence-document-header.helper.js')

// Thing under test
const LicenceDocumentHeaderModel = require('../../app/models/licence-document-header.model.js')

describe('Licence Document Header model', () => {
  let testLicenceEntityRole
  let testLicence
  let testRecord

  before(async () => {
    testLicenceEntityRole = await LicenceEntityRoleHelper.add()
    testLicence = await LicenceHelper.add()

    testRecord = await LicenceDocumentHeaderHelper.add({
      companyEntityId: testLicenceEntityRole.companyEntityId,
      licenceRef: testLicence.licenceRef
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentHeaderModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentHeaderModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentHeaderModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceDocumentHeaderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceDocumentHeaderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to licence entity role', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentHeaderModel.query()
          .innerJoinRelated('licenceEntityRole')

        expect(query).to.exist()
      })

      it('can eager load the licence entity role', async () => {
        const result = await LicenceDocumentHeaderModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceEntityRole')

        expect(result).to.be.instanceOf(LicenceDocumentHeaderModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEntityRole).to.be.an.instanceOf(LicenceEntityRoleModel)
        expect(result.licenceEntityRole).to.equal(testLicenceEntityRole)
      })
    })
  })
})
