'use strict'

// Test helpers
const GroupModel = require('../../../app/models/idm/group.model.js')
const GroupHelper = require('../../support/helpers/idm/group.helper.js')
const UserGroupHelper = require('../../support/helpers/idm/user-group.helper.js')
const UserModel = require('../../../app/models/idm/user.model.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')

// Thing under test
const UserGroupModel = require('../../../app/models/idm/user-group.model.js')

describe('User Group model', () => {
  let testGroup
  let testRecord
  let testUser

  beforeAll(async () => {
    testGroup = await GroupHelper.add()
    testUser = await UserHelper.add()

    testRecord = await UserGroupHelper.add({ groupId: testGroup.groupId, userId: testUser.userId })
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserGroupModel.query().findById(testRecord.userGroupId)

      expect(result).toBeInstanceOf(UserGroupModel)
      expect(result.userGroupId).toBe(testRecord.userGroupId)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('group')

        expect(query).toBeTruthy()
      })

      it('can eager load the group', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.userGroupId)
          .withGraphFetched('group')

        expect(result).toBeInstanceOf(UserGroupModel)
        expect(result.userGroupId).toBe(testRecord.userGroupId)

        expect(result.group).toBeInstanceOf(GroupModel)
        expect(result.group).toEqual(testGroup)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query()
          .innerJoinRelated('user')

        expect(query).toBeTruthy()
      })

      it('can eager load the user', async () => {
        const result = await UserGroupModel.query()
          .findById(testRecord.userGroupId)
          .withGraphFetched('user')

        expect(result).toBeInstanceOf(UserGroupModel)
        expect(result.userGroupId).toBe(testRecord.userGroupId)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toEqual(testUser)
      })
    })
  })
})
