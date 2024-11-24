'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceEntityHelper = require('../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../support/helpers/licence-entity-role.helper.js')
const LicenceEntityRoleModel = require('../../app/models/licence-entity-role.model.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const LicenceEntityModel = require('../../app/models/licence-entity.model.js')

describe('Licence Entity model', () => {
  let testLicenceEntityRoles
  let testRecord
  let testUser

  before(async () => {
    testRecord = await LicenceEntityHelper.add()

    const { id: licenceEntityId } = testRecord

    testLicenceEntityRoles = []
    for (let i = 0; i < 2; i++) {
      const licenceEntityRole = await LicenceEntityRoleHelper.add({ licenceEntityId })

      testLicenceEntityRoles.push(licenceEntityRole)
    }

    testUser = await UserHelper.add({ licenceEntityId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceEntityModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceEntityModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
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
  })
})
