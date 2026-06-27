'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceUnregistrationHelper = require('../support/helpers/licence-unregistration.helper.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const LicenceUnregistrationModel = require('../../app/models/licence-unregistration.model.js')

const { SKIP_COMPARE_LIST: skip } = UserHelper

describe('Licence Unregistration model', () => {
  let testLicence
  let testRecord
  let testUser

  before(async () => {
    testLicence = await LicenceHelper.add()
    testUser = UserHelper.select()
    testRecord = await LicenceUnregistrationHelper.add({ createdBy: testUser.id, licenceId: testLicence.id })
  })

  after(async () => {
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceUnregistrationModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(LicenceUnregistrationModel)
      expect(result.id).to.be.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceUnregistrationModel.query().innerJoinRelated('licence')

        expect(query).to.exist()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceUnregistrationModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).to.be.instanceOf(LicenceUnregistrationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.licence).to.be.instanceOf(LicenceModel)
        expect(result.licence).to.equal(testLicence)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceUnregistrationModel.query().innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await LicenceUnregistrationModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).to.be.instanceOf(LicenceUnregistrationModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.instanceOf(UserModel)
        expect(result.user).to.equal(testUser, { skip })
      })
    })
  })
})
