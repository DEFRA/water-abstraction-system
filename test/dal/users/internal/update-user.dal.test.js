'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const GroupHelper = require('../../../support/helpers/group.helper.js')
const RoleHelper = require('../../../support/helpers/role.helper.js')
const UserGroupHelper = require('../../../support/helpers/user-group.helper.js')
const UserGroupModel = require('../../../../app/models/user-group.model.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const UserModel = require('../../../../app/models/user.model.js')
const UserRoleHelper = require('../../../support/helpers/user-role.helper.js')
const UserRoleModel = require('../../../../app/models/user-role.model.js')

// Things we need to stub
const FetchUserDal = require('../../../../app/dal/users/fetch-user.dal.js')

// Thing under test
const UpdateUserDal = require('../../../../app/dal/users/internal/update-user.dal.js')

describe('Users - Internal - Update User DAL', () => {
  let auth
  let existingUser
  let existingUserGroup
  let existingUserRole
  let session

  beforeEach(async () => {
    const groupId = GroupHelper.data.find((group) => {
      return group.group === 'nps'
    }).id

    const roleId = RoleHelper.data.find((role) => {
      return role.role === 'ar_approver'
    }).id

    auth = { credentials: { user: { id: 'f42aa5b2-95e2-49c0-9ad4-4a7c3c5aefaf' } } }

    existingUser = await UserHelper.add()

    existingUserGroup = await UserGroupHelper.add({ groupId, userId: existingUser.userId })
    existingUserRole = await UserRoleHelper.add({ roleId, userId: existingUser.userId })

    session = {
      access: 'enabled',
      email: existingUser.username,
      permission: 'basic',
      user: {
        currentPermission: 'nps_ar_approver',
        enabled: true,
        id: existingUser.id,
        userId: existingUser.userId,
        username: existingUser.username
      }
    }

    Sinon.stub(FetchUserDal, 'go').resolves({ username: 'internal-user-creator@wrls.gov.uk' })
  })

  afterEach(async () => {
    await EventModel.query().delete().where({ issuer: 'internal-user-creator@wrls.gov.uk' })
    await UserGroupModel.query().delete().where({ userId: existingUser.userId })
    await UserRoleModel.query().delete().where({ userId: existingUser.userId })
    await existingUser.$query().delete()

    Sinon.restore()
  })

  describe('when called', () => {
    it('updates the user', async () => {
      await UpdateUserDal.go(auth, session)

      const user = await UserModel.query().findById(existingUser.id)

      expect(user).toMatchObject({
        application: 'water_admin',
        badLogins: 0,
        enabled: true,
        lastLogin: null,
        licenceEntityId: null,
        resetGuid: null,
        resetRequired: 0,
        resetGuidCreatedAt: null,
        userData: null,
        username: existingUser.username
      })
      expect(user.updatedAt).not.toEqual(existingUser.updatedAt)
    })

    it('creates an event', async () => {
      await UpdateUserDal.go(auth, session)

      const event = await EventModel.query().where('issuer', 'internal-user-creator@wrls.gov.uk').limit(1).first()

      expect(event).toMatchObject({
        referenceCode: null,
        type: 'update-user-roles',
        subtype: 'internal',
        issuer: 'internal-user-creator@wrls.gov.uk',
        licences: [],
        entities: [],
        metadata: {
          user: session.email,
          userId: existingUser.userId
        },
        status: null,
        overallStatus: null,
        statusCounts: null,
        triggerNoticeId: null
      })

      expect(event.createdAt).toBeInstanceOf(Date)
      expect(event.updatedAt).toBeInstanceOf(Date)
    })

    describe('and the email has changed', () => {
      beforeEach(() => {
        session.email = UserHelper.generateUserName()
      })

      it('updates the username', async () => {
        await UpdateUserDal.go(auth, session)

        const user = await UserModel.query().findById(existingUser.id)

        expect(user.username).toEqual(session.email)
      })

      it('replaces the existing resetGuid with a new one and returns the updated users resetGuid', async () => {
        const result = await UpdateUserDal.go(auth, session)

        const { resetGuid } = await UserModel.query().findById(existingUser.id)

        expect(resetGuid).toBeDefined()
        expect(resetGuid).not.toEqual(existingUser.resetGuid)
        expect(result).toEqual(resetGuid)
      })
    })

    describe('and the email has not changed', () => {
      it('does not update the username and returns undefined', async () => {
        const result = await UpdateUserDal.go(auth, session)

        const user = await UserModel.query().findById(existingUser.id)

        expect(user.username).toEqual(existingUser.username)
        expect(result).toBeUndefined()
      })
    })

    describe('and the permission has changed', () => {
      describe('and the new permission has no groups or roles', () => {
        it('does not create any user groups or user roles', async () => {
          await UpdateUserDal.go(auth, session)

          const userGroup = await UserGroupModel.query().where({ userId: existingUser.userId })
          const userRole = await UserRoleModel.query().where({ userId: existingUser.userId })

          expect(userGroup).toHaveLength(0)
          expect(userRole).toHaveLength(0)
        })
      })

      describe('and the new permission has groups but no roles', () => {
        beforeEach(() => {
          session.permission = 'nps'
        })

        it('creates the user groups but no user roles', async () => {
          await UpdateUserDal.go(auth, session)

          const userGroup = await UserGroupModel.query()
            .where({ userId: existingUser.userId })
            .withGraphFetched('group')
          const userRole = await UserRoleModel.query().where({ userId: existingUser.userId })

          expect(userGroup).toHaveLength(1)
          expect(userGroup[0].userId).toEqual(existingUser.userId)
          expect(userGroup[0].group.group).toEqual('nps')
          expect(userRole).toHaveLength(0)
        })
      })

      describe('and the new permission has both groups and roles', () => {
        beforeEach(() => {
          session.permission = 'nps_ar_user'
        })

        it('creates the user groups and user roles', async () => {
          await UpdateUserDal.go(auth, session)

          const userGroup = await UserGroupModel.query()
            .where({ userId: existingUser.userId })
            .withGraphFetched('group')
          const userRole = await UserRoleModel.query().where({ userId: existingUser.userId }).withGraphFetched('role')

          expect(userGroup).toHaveLength(1)
          expect(userGroup[0].userId).toEqual(existingUser.userId)
          expect(userGroup[0].group.group).toEqual('nps')
          expect(userRole).toHaveLength(1)
          expect(userRole[0].userId).toEqual(existingUser.userId)
          expect(userRole[0].role.role).toEqual('ar_user')
        })
      })
    })

    describe('and the permission has not changed', () => {
      beforeEach(() => {
        session.permission = session.user.currentPermission
      })

      it('does not remove the existing user groups or user roles', async () => {
        await UpdateUserDal.go(auth, session)

        const userGroup = await UserGroupModel.query().where({ id: existingUserGroup.id, userId: existingUser.userId })
        const userRole = await UserRoleModel.query().where({ id: existingUserRole.id, userId: existingUser.userId })

        expect(userGroup).toHaveLength(1)
        expect(userRole).toHaveLength(1)
      })
    })

    describe('and the user has been disabled', () => {
      beforeEach(() => {
        session.access = 'disabled'
      })

      it('disables the user', async () => {
        await UpdateUserDal.go(auth, session)

        const user = await UserModel.query().findById(existingUser.id)

        expect(user.enabled).toBe(false)
      })
    })
  })
})
