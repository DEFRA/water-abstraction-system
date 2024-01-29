'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')

// Thing under test
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')

describe('Licence Entity Role model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await LicenceEntityRoleHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityRoleModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEntityRoleModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company entity', () => {
      let testCompanyEntity

      beforeEach(async () => {
        testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })

        const { id: companyEntityId } = testCompanyEntity
        testRecord = await LicenceEntityRoleHelper.add({ companyEntityId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query()
          .innerJoinRelated('companyEntity')

        expect(query).to.exist()
      })

      it('can eager load the company entity', async () => {
        const result = await LicenceEntityRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('companyEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.companyEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.companyEntity).to.equal(testCompanyEntity)
      })
    })

    describe('when linking to licence entity', () => {
      let testLicenceEntity

      beforeEach(async () => {
        testLicenceEntity = await LicenceEntityHelper.add()

        const { id: licenceEntityId } = testLicenceEntity
        testRecord = await LicenceEntityRoleHelper.add({ licenceEntityId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query()
          .innerJoinRelated('licenceEntity')

        expect(query).to.exist()
      })

      it('can eager load the licence entity', async () => {
        const result = await LicenceEntityRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('licenceEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licenceEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.licenceEntity).to.equal(testLicenceEntity)
      })
    })

    describe('when linking to regime entity', () => {
      let testRegimeEntity

      beforeEach(async () => {
        testRegimeEntity = await LicenceEntityHelper.add({ type: 'regime' })

        const { id: regimeEntityId } = testRegimeEntity
        testRecord = await LicenceEntityRoleHelper.add({ regimeEntityId })
      })

      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query()
          .innerJoinRelated('regimeEntity')

        expect(query).to.exist()
      })

      it('can eager load the regime entity', async () => {
        const result = await LicenceEntityRoleModel.query()
          .findById(testRecord.id)
          .withGraphFetched('regimeEntity')

        expect(result).to.be.instanceOf(LicenceEntityRoleModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.regimeEntity).to.be.an.instanceOf(LicenceEntityModel)
        expect(result.regimeEntity).to.equal(testRegimeEntity)
      })
    })
  })
})
