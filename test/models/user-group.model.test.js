'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const GroupModel = require('../../app/models/group.model.js')
const GroupHelper = require('../support/helpers/group.helper.js')
const UserGroupHelper = require('../support/helpers/user-group.helper.js')
const UserModel = require('../../app/models/user.model.js')
const UserHelper = require('../support/helpers/user.helper.js')

// Thing under test
const UserGroupModel = require('../../app/models/user-group.model.js')

const GROUP_WIRS_INDEX = 2
const USER_GROUP_WIRS_INDEX = 3
const USER_WIRS_INDEX = 3

const { SKIP_COMPARE_LIST: skip } = UserHelper

describe('User Group model', () => {
  let testGroup
  let testRecord
  let testUser

  before(async () => {
    testRecord = UserGroupHelper.select(USER_GROUP_WIRS_INDEX)

    testGroup = GroupHelper.select(GROUP_WIRS_INDEX)
    testUser = UserHelper.select(USER_WIRS_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserGroupModel.query().findById(testRecord.id)

      expect(result).to.be.an.instanceOf(UserGroupModel)
      expect(result.id).to.equal(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query().innerJoinRelated('group')

        expect(query).to.exist()
      })

      it('can eager load the group', async () => {
        const result = await UserGroupModel.query().findById(testRecord.id).withGraphFetched('group')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.group).to.be.an.instanceOf(GroupModel)
        expect(result.group).to.equal(testGroup, { skip: ['createdAt', 'updatedAt'] })
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query().innerJoinRelated('user')

        expect(query).to.exist()
      })

      it('can eager load the user', async () => {
        const result = await UserGroupModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).to.be.instanceOf(UserGroupModel)
        expect(result.id).to.equal(testRecord.id)

        expect(result.user).to.be.an.instanceOf(UserModel)
        expect(result.user).to.equal(testUser, { skip })
      })
    })
  })
})
