'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../support/helpers/database.helper.js')
const GroupModel = require('../../app/models/group.model.js')
const GroupHelper = require('../support/helpers/group.helper.js')
const UserGroupHelper = require('../support/helpers/user-group.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserHelper = require('../support/helpers/user.helper.js')

// Thing under test
const UserGroupModel = require('../../app/models/user-group.model.js')

describe('User Group model', () => {
  let testRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord = await UserGroupHelper.add()
    })

    it('can successfully run a basic query', async () => {
      const result = await UserGroupModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(UserGroupModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group', () => {
      let testGroup

      beforeEach(async () => {
        testGroup = await GroupHelper.add()
        testRecord = await UserGroupHelper.add({ groupId: testGroup.id })
      })

      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('group')

        expect(query).to.exist()
      })

      it('can eager load the group', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('group')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.group).to.be.an.instanceOf(GroupModel)
        expect(result.group).to.equal(testGroup)
      })
    })

    describe('when linking to user', () => {
      let testUser

      beforeEach(async () => {
        testUser = await UserHelper.add()
        testRecord = await UserGroupHelper.add({ userId: testUser.id })
      })

      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.id)
          .withGraphFetched('user')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })
  })
})
