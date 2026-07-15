// Test helpers
import * as GroupHelper from '../support/helpers/group.helper.js'
import * as GroupRoleHelper from '../support/helpers/group-role.helper.js'
import * as RoleHelper from '../support/helpers/role.helper.js'
import * as UserHelper from '../support/helpers/user.helper.js'
import * as UserRoleHelper from '../support/helpers/user-role.helper.js'
import GroupModel from '../../app/models/group.model.js'
import GroupRoleModel from '../../app/models/group-role.model.js'
import UserModel from '../../app/models/user.model.js'
import UserRoleModel from '../../app/models/user-role.model.js'

// Thing under test
import RoleModel from '../../app/models/role.model.js'

const GROUP_ROLE_SUPER_AR_USER_INDEX = 16
const GROUP_SUPER_INDEX = 5
const ROLE_AR_USER_INDEX = 6
const USER_DIGITISE_EDITOR_INDEX = 11
const USER_ROLE_AR_USER_INDEX = 0

describe('Role model', () => {
  let testGroup
  let testGroupRole
  let testRecord
  let testUser
  let testUserRole

  beforeAll(async () => {
    // This combination has one match in group roles and so ensures we only get one result making testing clearer
    testRecord = RoleHelper.select(ROLE_AR_USER_INDEX)
    testGroup = GroupHelper.select(GROUP_SUPER_INDEX)
    testGroupRole = GroupRoleHelper.select(GROUP_ROLE_SUPER_AR_USER_INDEX)
    testUser = UserHelper.select(USER_DIGITISE_EDITOR_INDEX)
    testUserRole = UserRoleHelper.select(USER_ROLE_AR_USER_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await RoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(RoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to group roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('groupRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the group roles', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('groupRoles')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.groupRoles).toBeInstanceOf(Array)
        expect(result.groupRoles).toHaveLength(1)
        expect(result.groupRoles[0]).toBeInstanceOf(GroupRoleModel)
        expect(result.groupRoles[0]).toMatchObject(testGroupRole)
      })
    })

    describe('when linking to user roles', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('userRoles')

        expect(query).toBeDefined()
      })

      it('can eager load the user roles', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('userRoles')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.userRoles).toBeInstanceOf(Array)
        expect(result.userRoles).toHaveLength(1)
        expect(result.userRoles[0]).toBeInstanceOf(UserRoleModel)
        expect(result.userRoles[0]).toMatchObject(testUserRole)
      })
    })

    describe('when linking through group roles to groups', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('groups')

        expect(query).toBeDefined()
      })

      it('can eager load the groups', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('groups')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.groups).toBeInstanceOf(Array)
        expect(result.groups).toHaveLength(1)
        expect(result.groups[0]).toBeInstanceOf(GroupModel)
        expect(result.groups[0]).toMatchObject(testGroup)
      })
    })

    describe('when linking through user roles to users', () => {
      it('can successfully run a related query', async () => {
        const query = await RoleModel.query().innerJoinRelated('users')

        expect(query).toBeDefined()
      })

      it('can eager load the users', async () => {
        const result = await RoleModel.query().findById(testRecord.id).withGraphFetched('users')

        expect(result).toBeInstanceOf(RoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.users).toBeInstanceOf(Array)
        expect(result.users).toHaveLength(1)
        expect(result.users[0]).toBeInstanceOf(UserModel)
        expect(result.users[0]).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})
