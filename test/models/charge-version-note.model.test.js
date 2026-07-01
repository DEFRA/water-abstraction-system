'use strict'

// Test helpers
const ChargeVersionHelper = require('../support/helpers/charge-version.helper.js')
const ChargeVersionModel = require('../../app/models/charge-version.model.js')
const ChargeVersionNoteHelper = require('../support/helpers/charge-version-note.helper.js')
const UserHelper = require('../support/helpers/user.helper.js')
const UserModel = require('../../app/models/user.model.js')

// Thing under test
const ChargeVersionNoteModel = require('../../app/models/charge-version-note.model.js')

describe('Charge Version Note model', () => {
  let testChargeVersion
  let testRecord
  let testUser

  beforeAll(async () => {
    testUser = UserHelper.select()
    testRecord = await ChargeVersionNoteHelper.add({ userId: testUser.userId })
    testChargeVersion = await ChargeVersionHelper.add({ noteId: testRecord.id })
  })

  afterAll(async () => {
    await testChargeVersion.$query().delete()

    await testRecord.$query().delete()
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionNoteModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(ChargeVersionNoteModel)
      expect(result.id).to.be.toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionNoteModel.query().innerJoinRelated('chargeVersion')

        expect(query).toBeDefined()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeVersionNoteModel.query().findById(testRecord.id).withGraphFetched('chargeVersion')

        expect(result).toBeInstanceOf(ChargeVersionNoteModel)
        expect(result.id).toEqual(testRecord.id)

        expect(result.chargeVersion).toBeInstanceOf(ChargeVersionModel)
        expect(result.chargeVersion).toEqual(testChargeVersion)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionNoteModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await ChargeVersionNoteModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(ChargeVersionNoteModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})
