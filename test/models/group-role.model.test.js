// Test framework
import { beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import GroupHelper from '../support/helpers/group.helper.js'
import GroupModel from '../../app/models/group.model.js'
import GroupRoleHelper from '../support/helpers/group-role.helper.js'
import RoleHelper from '../support/helpers/role.helper.js'
import RoleModel from '../../app/models/role.model.js'

// Thing under test
import GroupRoleModel from '../../app/models/group-role.model.js'

const GROUP_BILLING_DATA_INDEX = 1
const GROUP_ROLE_BILLING_DATA_INDEX = 18
const ROLE_BILLING_INDEX = 8

describe('Group Role model', () => {
  let testGroup
  let testRecord
  let testRole

  beforeAll(async () => {
    testRecord = GroupRoleHelper.select(GROUP_ROLE_BILLING_DATA_INDEX)

    testGroup = GroupHelper.select(GROUP_BILLING_DATA_INDEX)
    testRole = RoleHelper.select(ROLE_BILLING_INDEX)
  })

  describe('Basic query', () => {
    it('can successfully run a basic query', async () => {
      const result = await GroupRoleModel.query().findById(testRecord.id)

      expect(result).toBeInstanceOf(GroupRoleModel)
      expect(result.id).toEqual(testRecord.id)
    })
  })

  describe('Relationships', () => {
    describe('when linking to role', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query().innerJoinRelated('role')

        expect(query).toBeDefined()
      })

      it('can eager load the role', async () => {
        const result = await GroupRoleModel.query().findById(testRecord.id).withGraphFetched('role')

        expect(result).toBeInstanceOf(GroupRoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.role).toBeInstanceOf(RoleModel)
        expect(result.role).toMatchObject(testRole)
      })
    })

    describe('when linking to group', () => {
      it('can successfully run a related query', async () => {
        const query = await GroupRoleModel.query().innerJoinRelated('group')

        expect(query).toBeDefined()
      })

      it('can eager load the group', async () => {
        const result = await GroupRoleModel.query().findById(testRecord.id).withGraphFetched('group')

        expect(result).toBeInstanceOf(GroupRoleModel)
        expect(result.id).toMatchObject(testRecord.id)

        expect(result.group).toBeInstanceOf(GroupModel)
        expect(result.group).toMatchObject(testGroup)
      })
    })
  })
})
