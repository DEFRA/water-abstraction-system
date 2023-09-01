'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const GroupModel = require('../../../app/models/idm/group.model.js')
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')

// Thing under test
const UserGroupModel = require('../../../app/models/idm/user-group.model.js')

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
      const result = await UserGroupModel.query().findById(testRecord.userGroupId)

      expect(result).to.be.an.instanceOf(UserGroupModel)
      expect(result.userGroupId).to.equal(testRecord.userGroupId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group', () => {
      let testGroup

      beforeEach(async () => {
        testGroup = await GroupHelper.add()
        testRecord = await UserGroupHelper.add({ groupId: testGroup.groupId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('group')

        expect(query).to.exist()
      })

      it('can eager load the group', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.userGroupId)
          .withGraphFetched('group')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.userGroupId).to.equal(testRecord.userGroupId)

        expect(result.group).to.be.an.instanceOf(GroupModel)
        expect(result.group).to.equal(testGroup)
      })
    })

    describe('when linking to user', () => {
      let testUser

      beforeEach(async () => {
        testUser = await UserHelper.add()
        testRecord = await UserGroupHelper.add({ userId: testUser.userId })
      })

      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.userGroupId)
          .withGraphFetched('user')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.userGroupId).to.equal(testRecord.userGroupId)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser)
      })
    })
  })
})
