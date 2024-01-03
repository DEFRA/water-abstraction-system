'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceRoleHelper = require('../support/helpers/licence-role.helper.js')
const LicenceRoleModel = require('../../app/models/licence-role.model.js')

// Thing under test
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

describe('Licence Document Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceDocumentRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence document', () => {
      let testLicenceDocument

      beforeEach(async () => {
        testLicenceDocument = await LicenceDocumentHelper.add()

        const { id: licenceDocumentId } = testLicenceDocument
        testRecord = await LicenceDocumentRoleHelper.add({ licenceDocumentId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query()
          .innerJoinRelated('licenceDocument')

        expect(query).to.exist()
      })

      it('can eager load the licence document', async () => {
        const result = await LicenceDocumentRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocument')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocument).to.be.an.instanceOf(LicenceDocumentModel)
        expect(result.licenceDocument).to.equal(testLicenceDocument)
      })
    })

    describe('when linking to licence role', () => {
      let testLicenceRole

      beforeEach(async () => {
        testLicenceRole = await LicenceRoleHelper.add()

        const { id: licenceRoleId } = testLicenceRole
        testRecord = await LicenceDocumentRoleHelper.add({ licenceRoleId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentRoleModel.query()
          .innerJoinRelated('licenceRole')

        expect(query).to.exist()
      })

      it('can eager load the licence role', async () => {
        const result = await LicenceDocumentRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceRole')

        expect(result).to.be.instanceOf(LicenceDocumentRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceRole).to.be.an.instanceOf(LicenceRoleModel)
        expect(result.licenceRole).to.equal(testLicenceRole)
      })
    })
  })
})
