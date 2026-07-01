'use strict'

// Test helpers
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')

// Thing under test
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')

describe('Licence Entity Role model', () => {
  let testCompanyEntity
  let testLicenceEntity
  let testRecord
  let testRegimeEntity

  beforeAll(async () => {
    testCompanyEntity = await LicenceEntityHelper.add({ type: 'company' })
    testLicenceEntity = await LicenceEntityHelper.add()
    testRegimeEntity = await LicenceEntityHelper.add({ type: 'regime' })

    testRecord = await LicenceEntityRoleHelper.add({
      companyEntityId: testCompanyEntity.id,
      licenceEntityId: testLicenceEntity.id,
      regimeEntityId: testRegimeEntity.id
    })
  })

  afterAll(async () => {
    await testCompanyEntity.$query().delete()
    await testLicenceEntity.$query().delete()
    await testRegimeEntity.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityRoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceEntityRoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to company entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('companyEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the company entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('companyEntity')

        expect(result).toBeInstanceOf(LicenceEntityRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.companyEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.companyEntity).toEqual(testCompanyEntity)
      })
    })

    describe('when linking to licence entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('licenceEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the licence entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('licenceEntity')

        expect(result).toBeInstanceOf(LicenceEntityRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licenceEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.licenceEntity).toEqual(testLicenceEntity)
      })
    })

    describe('when linking to regime entity', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceEntityRoleModel.query().innerJoinRelated('regimeEntity')

        expect(query).toBeDefined()
      })

      it('can eager load the regime entity', async () => {
        const result = await LicenceEntityRoleModel.query().findById(testRecord.id).withGraphFetched('regimeEntity')

        expect(result).toBeInstanceOf(LicenceEntityRoleModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.regimeEntity).toBeInstanceOf(LicenceEntityModel)
        expect(result.regimeEntity).toEqual(testRegimeEntity)
      })
    })
  })
})
