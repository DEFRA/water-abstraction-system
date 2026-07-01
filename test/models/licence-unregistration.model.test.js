'use strict'

// Test helpers
const LicenceHelper = require('../support/helpers/licence.helper.js')
const LicenceModel = require('../../app/models/licence.model.js')
const LicenceUnregistrationHelper = require('../support/helpers/licence-unregistration.helper.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const LicenceUnregistrationModel = require('../../app/models/licence-unregistration.model.js')

describe('Licence Unregistration model', () => {
  let testLicence
  let testRecord
  let testUser

  beforeAll(async () => {
    testLicence = await LicenceHelper.add()
    testUser = UserHelper.select()
    testRecord = await LicenceUnregistrationHelper.add({ createdBy: testUser.id, licenceId: testLicence.id })
  })

  afterAll(async () => {
    await testLicence.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await LicenceUnregistrationModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(LicenceUnregistrationModel)
      expect(result.id).to.be.toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to licence', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceUnregistrationModel.query().innerJoinRelated('licence')

        expect(query).toBeDefined()
      })

      it('can eager load the licence', async () => {
        const result = await LicenceUnregistrationModel.query().findById(testRecord.id).withGraphFetched('licence')

        expect(result).toBeInstanceOf(LicenceUnregistrationModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.licence).toBeInstanceOf(LicenceModel)
        expect(result.licence).toEqual(testLicence)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await LicenceUnregistrationModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await LicenceUnregistrationModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(LicenceUnregistrationModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})
