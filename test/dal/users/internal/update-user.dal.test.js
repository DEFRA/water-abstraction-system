'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const UserGroupModel = require('../../../../app/models/user-group.model.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const UserModel = require('../../../../app/models/user.model.js')
const UserRoleModel = require('../../../../app/models/user-role.model.js')

// Things we need to stub
const FetchUserDal = require('../../../../app/dal/users/fetch-user.dal.js')

// Thing under test
const UpdateUserDal = require('../../../../app/dal/users/internal/update-user.dal.js')

describe('Users - Internal - Update User DAL', () => {
  let auth
  let existingUser
  let session

  beforeEach(async () => {
    auth = { credentials: { user: { id: 'f42aa5b2-95e2-49c0-9ad4-4a7c3c5aefaf' } } }

    existingUser = await UserHelper.add()

    session = {
      email: UserHelper.generateUserName(),
      permission: 'basic',
      user: { id: existingUser.id, userId: existingUser.userId, username: existingUser.username }
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
    describe('and the email has changed', () => {
      it('updates the user with the correct attributes', async () => {
        await UpdateUserDal.go(auth, session)

        const user = await UserModel.query().where('username', session.email).limit(1).first()

        expect(user.resetGuid).to.exist()
        expect(user.username).to.equal(session.email)
      })

      it('creates an event', async () => {
        await UpdateUserDal.go(auth, session)

        const event = await EventModel.query().where('issuer', 'internal-user-creator@wrls.gov.uk').limit(1).first()

        expect(event.createdAt).to.be.instanceof(Date)
        expect(event.entities).to.equal([])
        expect(event.issuer).to.equal('internal-user-creator@wrls.gov.uk')
        expect(event.licences).to.equal([])
        expect(event.metadata).to.equal({ user: session.email, userId: existingUser.userId })
        expect(event.subtype).to.equal('internal')
        expect(event.type).to.equal('update-user-roles')
        expect(event.updatedAt).to.be.instanceof(Date)
      })

      it('replaces the existing resetGuid with a new one', async () => {
        await UpdateUserDal.go(auth, session)

        const { resetGuid } = await UserModel.query().where('username', session.email).limit(1).first()

        expect(resetGuid).to.exist()
        expect(resetGuid).to.not.equal(existingUser.resetGuid)
      })

      it('returns the updated users resetGuid', async () => {
        const result = await UpdateUserDal.go(auth, session)

        const { resetGuid } = await UserModel.query().where('username', session.email).limit(1).first()

        expect(result).to.equal(resetGuid)
      })
    })

    describe('and the email has not changed', () => {
      beforeEach(() => {
        session.email = existingUser.username
      })

      it('does not update the username', async () => {
        await UpdateUserDal.go(auth, session)

        const user = await UserModel.query().where('username', existingUser.username).limit(1).first()

        expect(user.username).to.equal(existingUser.username)
      })

      it('returns undefined', async () => {
        const result = await UpdateUserDal.go(auth, session)

        expect(result).to.be.undefined()
      })
    })

    describe('and the permission has no groups or roles', () => {
      beforeEach(() => {
        session.permission = 'basic'
      })

      it('does not create any user groups', async () => {
        await UpdateUserDal.go(auth, session)

        const userGroup = await UserGroupModel.query().where({ userId: existingUser.userId })

        expect(userGroup).to.be.empty()
      })

      it('does not create any user roles', async () => {
        await UpdateUserDal.go(auth, session)

        const userRole = await UserRoleModel.query().where({ userId: existingUser.userId })

        expect(userRole).to.be.empty()
      })
    })

    describe('and the permission has groups but no roles', () => {
      beforeEach(() => {
        session.permission = 'nps'
      })

      it('creates the user groups', async () => {
        await UpdateUserDal.go(auth, session)

        const userGroup = await UserGroupModel.query().where({ userId: existingUser.userId }).withGraphFetched('group')

        expect(userGroup).to.have.length(1)
        expect(userGroup[0].userId).to.equal(existingUser.userId)
        expect(userGroup[0].group.group).to.equal('nps')
      })

      it('does not create any user roles', async () => {
        await UpdateUserDal.go(auth, session)

        const userRole = await UserRoleModel.query().where({ userId: existingUser.userId })

        expect(userRole).to.be.empty()
      })
    })

    describe('and the permission has both groups and roles', () => {
      beforeEach(() => {
        session.permission = 'nps_ar_approver'
      })

      it('creates the user groups', async () => {
        await UpdateUserDal.go(auth, session)

        const userGroup = await UserGroupModel.query().where({ userId: existingUser.userId }).withGraphFetched('group')

        expect(userGroup).to.have.length(1)
        expect(userGroup[0].userId).to.equal(existingUser.userId)
        expect(userGroup[0].group.group).to.equal('nps')
      })

      it('creates the user roles', async () => {
        await UpdateUserDal.go(auth, session)

        const userRole = await UserRoleModel.query().where({ userId: existingUser.userId }).withGraphFetched('role')

        expect(userRole).to.have.length(1)
        expect(userRole[0].userId).to.equal(existingUser.userId)
        expect(userRole[0].role.role).to.equal('ar_approver')
      })
    })
  })
})
