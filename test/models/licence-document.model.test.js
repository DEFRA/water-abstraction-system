'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceDocumentHelper = require('../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../support/helpers/licence-document-role.helper.js')
const LicenceDocumentRoleModel = require('../../app/models/licence-document-role.model.js')

// Thing under test
const LicenceDocumentModel = require('../../app/models/licence-document.model.js')

describe('Licence Document model', () => {
  let testRecord

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceDocumentHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceDocumentModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceDocumentModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      let testLicence

      beforeEach(async () => {
        testLicence = await LicenceHelper.add()

        const { licenceRef } = testLicence

        testRecord = await LicenceDocumentHelper.add({ licenceRef })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentModel.query()
          .innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceDocumentModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceDocumentModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.an.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to licence document roles', () => {
      let testLicenceDocumentRoles

      beforeEach(async () => {
        testRecord = await LicenceDocumentHelper.add()

        const { id: licenceDocumentId } = testRecord

        testLicenceDocumentRoles = []
        for (let i = 0; i < 2; i++) {
          const licenceDocumentRole = await LicenceDocumentRoleHelper.add({ licenceDocumentId })

          testLicenceDocumentRoles.push(licenceDocumentRole)
        }
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceDocumentModel.query()
          .innerJoinRelated('licenceDocumentRoles')

        expect(query).to.exist()
      })

      it('can eager load the licence document roles', async () => {
        const result = await LicenceDocumentModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentRoles')

        expect(result).to.be.instanceOf(LicenceDocumentModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentRoles).to.be.an.array()
        expect(result.licenceDocumentRoles[0]).to.be.an.instanceOf(LicenceDocumentRoleModel)
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[0])
        expect(result.licenceDocumentRoles).to.include(testLicenceDocumentRoles[1])
      })
    })
  })
})
