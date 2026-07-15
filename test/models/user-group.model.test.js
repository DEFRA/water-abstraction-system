// Test helpers
import GroupHelper from '../support/helpers/group.helper.js'
import GroupModel from '../../app/models/group.model.js'
import UserGroupHelper from '../support/helpers/user-group.helper.js'
import UserHelper from '../support/helpers/user.helper.js'
import UserModel from '../../app/models/user.model.js'

// Thing under test
import UserGroupModel from '../../app/models/user-group.model.js'

const GROUP_WIRS_INDEX = 2
const USER_GROUP_WIRS_INDEX = 3
const USER_WIRS_INDEX = 3

describe('User Group model', () => {
  let testGroup
  let testRecord
  let testUser

  beforeAll(async () => {
    testRecord = UserGroupHelper.select(USER_GROUP_WIRS_INDEX)

    testGroup = GroupHelper.select(GROUP_WIRS_INDEX)
    testUser = UserHelper.select(USER_WIRS_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserGroupModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(UserGroupModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query().innerJoinRelated('group')

        expect(query).toBeDefined()
      })

      it('can eager load the group', async () => {
        const result = await UserGroupModel.query().findById(testRecord.id).withGraphFetched('group')

        expect(result).toBeInstanceOf(UserGroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.group).toBeInstanceOf(GroupModel)
        expect(result.group).toMatchObject(testGroup)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await UserGroupModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await UserGroupModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(UserGroupModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})
