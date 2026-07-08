// Test helpers
import RoleModel from '../../app/models/role.model.js'
import * as RoleHelper from '../support/helpers/role.helper.js'
import * as UserRoleHelper from '../support/helpers/user-role.helper.js'
import UserModel from '../../app/models/user.model.js'
import * as UserHelper from '../support/helpers/user.helper.js'

// Thing under test
import UserRoleModel from '../../app/models/user-role.model.js'

const ROLE_AR_USER_INDEX = 6
const USER_DIGITISE_EDITOR_INDEX = 11
const USER_ROLE_AR_USER_INDEX = 0

describe('User Role model', () => {
  let testRecord
  let testRole
  let testUser

  beforeAll(() => {
    testRole = RoleHelper.select(ROLE_AR_USER_INDEX)
    testUser = UserHelper.select(USER_DIGITISE_EDITOR_INDEX)
    testRecord = UserRoleHelper.select(USER_ROLE_AR_USER_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await UserRoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(UserRoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query().innerJoinRelated('role')

        expect(query).toBeDefined()
      })

      it('can eager load the role', async () => {
        const result = await UserRoleModel.query().findById(testRecord.id).withGraphFetched('role')

        expect(result).toBeInstanceOf(UserRoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.role).toBeInstanceOf(RoleModel)
        expect(result.role).toMatchObject(testRole)
      })
    })

    describe('when linking to user', () => {
      it('can successfully run a related query', async () => {
        const query = await UserRoleModel.query().innerJoinRelated('user')

        expect(query).toBeDefined()
      })

      it('can eager load the user', async () => {
        const result = await UserRoleModel.query().findById(testRecord.id).withGraphFetched('user')

        expect(result).toBeInstanceOf(UserRoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.user).toBeInstanceOf(UserModel)
        expect(result.user).toMatchObject({ ...testUser, password: expect.any(String) })
      })
    })
  })
})
