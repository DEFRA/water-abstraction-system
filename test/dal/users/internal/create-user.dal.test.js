// Test helpers
import EventModel from '../../../../app/models/event.model.js'
import UserGroupModel from '../../../../app/models/user-group.model.js'
import UserModel from '../../../../app/models/user.model.js'
import UserRoleModel from '../../../../app/models/user-role.model.js'
import UserHelper from '../../../support/helpers/user.helper.js'

// Things we need to stub
import * as FetchUserDal from '../../../../app/dal/users/fetch-user.dal.js'

// Thing under test
import CreateUserDal from '../../../../app/dal/users/internal/create-user.dal.js'

describe('Users - Internal - Create User DAL', () => {
  let auth
  let session

  beforeEach(() => {
    const email = UserHelper.generateUserName()

    auth = { credentials: { user: { id: 'f42aa5b2-95e2-49c0-9ad4-4a7c3c5aefaf' } } }
    session = { email, permission: 'basic' }

    vi.spyOn(FetchUserDal, 'default').mockResolvedValue({ username: 'internal-user-creator@wrls.gov.uk' })
  })

  afterEach(async () => {
    const user = await UserModel.query().where('username', session.email).limit(1).first()

    await EventModel.query().delete().where({ issuer: 'internal-user-creator@wrls.gov.uk' })

    if (user) {
      await UserGroupModel.query().delete().where({ userId: user.userId })
      await UserRoleModel.query().delete().where({ userId: user.userId })
      await user.$query().delete()
    }

    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('creates the user with the correct attributes', async () => {
      await CreateUserDal(auth, session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()

      expect(user).toMatchObject({
        application: 'water_admin',
        badLogins: 0,
        enabled: true,
        lastLogin: null,
        licenceEntityId: null,
        resetRequired: 1,
        userData: null,
        username: session.email
      })
      expect(user.password).toBeDefined()
      expect(user.resetGuid).toBeDefined()
      expect(user.resetGuidCreatedAt).toBeInstanceOf(Date)
    })

    it('creates an event', async () => {
      await CreateUserDal(auth, session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const event = await EventModel.query().where('issuer', 'internal-user-creator@wrls.gov.uk').limit(1).first()

      expect(event).toMatchObject({
        referenceCode: null,
        type: 'new-user',
        subtype: 'internal',
        issuer: 'internal-user-creator@wrls.gov.uk',
        licences: [],
        entities: [],
        metadata: {
          user: user.username,
          userId: user.userId
        },
        status: null,
        overallStatus: null,
        statusCounts: null,
        triggerNoticeId: null
      })
      expect(event.createdAt).toBeInstanceOf(Date)
      expect(event.updatedAt).toBeInstanceOf(Date)
    })

    it('returns the the new users resetGuid', async () => {
      const result = await CreateUserDal(auth, session)

      const { resetGuid } = await UserModel.query().where('username', session.email).limit(1).first()

      expect(result).toEqual(resetGuid)
    })

    describe('and the permission has no groups or roles', () => {
      beforeEach(() => {
        session.permission = 'basic'
      })

      it('does not create any user groups or user roles', async () => {
        await CreateUserDal(auth, session)

        const { userId } = await UserModel.query().where('username', session.email).limit(1).first()
        const userGroup = await UserGroupModel.query().where({ userId })
        const userRole = await UserRoleModel.query().where({ userId })

        expect(userGroup).toHaveLength(0)
        expect(userRole).toHaveLength(0)
      })
    })

    describe('and the permission has groups but no roles', () => {
      beforeEach(() => {
        session.permission = 'nps'
      })

      it('creates the user groups but no user roles', async () => {
        await CreateUserDal(auth, session)

        const { userId } = await UserModel.query().where('username', session.email).limit(1).first()
        const userGroup = await UserGroupModel.query().where({ userId }).withGraphFetched('group')
        const userRole = await UserRoleModel.query().where({ userId })

        expect(userGroup).toHaveLength(1)
        expect(userGroup[0].userId).toEqual(userId)
        expect(userGroup[0].group.group).toEqual('nps')
        expect(userRole).toHaveLength(0)
      })
    })

    describe('and the permission has both groups and roles', () => {
      beforeEach(() => {
        session.permission = 'nps_ar_approver'
      })

      it('creates the user groups and user roles', async () => {
        await CreateUserDal(auth, session)

        const { userId } = await UserModel.query().where('username', session.email).limit(1).first()
        const userGroup = await UserGroupModel.query().where({ userId }).withGraphFetched('group')
        const userRole = await UserRoleModel.query().where({ userId }).withGraphFetched('role')

        expect(userGroup).toHaveLength(1)
        expect(userGroup[0].userId).toEqual(userId)
        expect(userGroup[0].group.group).toEqual('nps')
        expect(userRole).toHaveLength(1)
        expect(userRole[0].userId).toEqual(userId)
        expect(userRole[0].role.role).toEqual('ar_approver')
      })
    })
  })
})
