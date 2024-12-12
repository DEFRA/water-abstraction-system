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
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')

// Thing under test
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')

describe('Licence Entity Role model', () => {
  let testCompanyEntity
  let testLicenceDocumentHeader
  let testLicenceEntity
  let testRecord
  let testRegimeEntity

  before(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ companyEntityId: testCompanyEntity.id })
    testLicenceEntity = await LicenceEntityHelper.add()
    testRegimeEntity = await LicenceEntityHelper.add({ type: 'regime' })

    testRecord = await LicenceEntityRoleHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id,
      regimeEntityId: testRegimeEntity.id
    })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEntityRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('companyEntity')

        expect(query).to.exist()
      })

      it('can eager load the company entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('companyEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.companyEntity).to.equal(testCompanyEntity)
      })
    })

    describe('when linking to licence document header', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('licenceDocumentHeader')

        expect(query).to.exist()
      })

      it('can eager load the licence document header', async () => {
        const result = await LicenceEntityRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceDocumentHeader')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceDocumentHeader).to.be.an.instanceOf(LicenceDocumentHeaderModel)
        expect(result.licenceDocumentHeader).to.equal(testLicenceDocumentHeader)
      })
    })

    describe('when linking to licence entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('licenceEntity')

        expect(query).to.exist()
      })

      it('can eager load the licence entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('licenceEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.licenceEntity).to.equal(testLicenceEntity)
      })
    })

    describe('when linking to regime entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('regimeEntity')

        expect(query).to.exist()
      })

      it('can eager load the regime entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('regimeEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.regimeEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.regimeEntity).to.equal(testRegimeEntity)
      })
    })
  })
})
