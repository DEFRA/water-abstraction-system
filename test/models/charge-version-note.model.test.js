'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

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

  before(async () => {
    testUser = UserHelper.select()
    testRecord = await ChargeVersionNoteHelper.add({ userId: testUser.id })
    testChargeVersion = await ChargeVersionHelper.add({ noteId: testRecord.id })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await ChargeVersionNoteModel.query()
        .findById(testRecord.id)

      expect(result).to.be.an.instanceOf(ChargeVersionNoteModel)
      expect(result.id).to.be.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to charge version', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionNoteModel.query()
          .innerJoinRelated('chargeVersion')

        expect(query).to.exist()
      })

      it('can eager load the charge version', async () => {
        const result = await ChargeVersionNoteModel.query()
          .findById(testRecord.id)
          .withGraphFetched('chargeVersion')

        expect(result).to.be.instanceOf(ChargeVersionNoteModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.chargeVersion).to.be.instanceOf(ChargeVersionModel)
        expect(result.chargeVersion).to.equal(testChargeVersion)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await ChargeVersionNoteModel.query()
          .innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await ChargeVersionNoteModel.query()
          .findById(testRecord.id)
          .withGraphFetched('user')

        expect(result).to.be.instanceOf(ChargeVersionNoteModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.instanceOf(UserModel)
        expect(result.user).to.equal(testUser, { skip: ['createdAt', 'licenceEntityId', 'password', 'updatedAt'] })
      })
    })
  })
})
