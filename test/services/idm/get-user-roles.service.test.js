'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const UserHelper = require('../../support/helpers/idm/user.helper.js')

// Thing under test
const GetUserRolesService = require('../../../app/services/idm/get-user-roles.service.js')

describe('Get User Roles service', () => {
  let testUser

  beforeEach(async () => {
    await DatabaseHelper.clean()
    testUser = await UserHelper.add()
  })

  describe('when the user exists', () => {
    it("returns the user's id", async () => {
      const result = await GetUserRolesService.go(testUser.userId)

      expect(result.userId).to.equal(testUser.userId)
    })

    // TODO: test that we actually return an array of groups
    it("returns the user's groups", async () => {
      const result = await GetUserRolesService.go(testUser.userId)

      expect(result.groups).to.equal([])
    })

    // TODO: test that we actually return an array of roles
    it("returns the user's roles", async () => {
      const result = await GetUserRolesService.go(testUser.userId)

      expect(result.roles).to.equal([])
    })
  })
})
