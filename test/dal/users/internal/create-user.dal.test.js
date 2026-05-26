'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { afterEach, beforeEach, describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UserGroupModel = require('../../../../app/models/user-group.model.js')
const UserModel = require('../../../../app/models/user.model.js')
const UserRoleModel = require('../../../../app/models/user-role.model.js')
const { generateUserName } = require('../../../support/helpers/user.helper.js')

// Thing under test
const CreateUserDal = require('../../../../app/dal/users/internal/create-user.dal.js')

describe('Users - Internal - Create User DAL', () => {
  let session

  afterEach(async () => {
    const user = await UserModel.query().where('username', session.email).limit(1).first()

    if (user) {
      await UserGroupModel.query().delete().where({ userId: user.userId })
      await UserRoleModel.query().delete().where({ userId: user.userId })
      await user.$query().delete()
    }
  })

  describe('when the permission has no groups or roles', () => {
    beforeEach(() => {
      session = { email: generateUserName(), permission: 'basic' }
    })

    it('returns a reset GUID', async () => {
      const result = await CreateUserDal.go(session)

      const { resetGuid } = await UserModel.query().where('username', session.email).limit(1).first()

      expect(result).to.equal(resetGuid)
    })

    it('creates the user with the correct attributes', async () => {
      await CreateUserDal.go(session)

      const result = await UserModel.query().where('username', session.email).limit(1).first()

      expect(result.application).to.equal('water_admin')
      expect(result.username).to.equal(session.email)
      expect(result.resetRequired).to.equal(1)
    })

    it('does not create any user groups', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserGroupModel.query().where({ userId: user.userId })

      expect(result).to.be.empty()
    })

    it('does not create any user roles', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserRoleModel.query().where({ userId: user.userId })

      expect(result).to.be.empty()
    })
  })

  describe('when the permission has groups but no roles', () => {
    beforeEach(() => {
      session = { email: generateUserName(), permission: 'nps' }
    })

    it('creates the user with "water_admin" as the application', async () => {
      await CreateUserDal.go(session)

      const result = await UserModel.query().where('username', session.email).limit(1).first()

      expect(result.application).to.equal('water_admin')
    })

    it('creates the user groups', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserGroupModel.query().where({ userId: user.userId })

      expect(result).to.have.length(1)
    })

    it('does not create any user roles', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserRoleModel.query().where({ userId: user.userId })

      expect(result).to.be.empty()
    })
  })

  describe('when the permission has both groups and roles', () => {
    beforeEach(() => {
      session = { email: generateUserName(), permission: 'nps_ar_approver' }
    })

    it('creates the user groups', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserGroupModel.query().where({ userId: user.userId })

      expect(result).to.have.length(1)
    })

    it('creates the user roles', async () => {
      await CreateUserDal.go(session)

      const user = await UserModel.query().where('username', session.email).limit(1).first()
      const result = await UserRoleModel.query().where({ userId: user.userId })

      expect(result).to.have.length(1)
    })
  })
})
