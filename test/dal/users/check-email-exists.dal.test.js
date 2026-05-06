'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, after, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const UserHelper = require('../../support/helpers/user.helper.js')

// Thing under test
const CheckEmailExistsDal = require('../../../app/dal/users/check-email-exists.dal.js')

describe('DAL - Check email exists dal', () => {
  let email
  let user

  describe('when the user exists', () => {
    before(async () => {
      user = await UserHelper.add()
      email = user.username
    })

    after(async () => {
      await user.$query().delete()
    })

    it('returns "true"', async () => {
      const result = await CheckEmailExistsDal.go(email)

      expect(result).to.be.true()
    })
  })

  describe('when the user does not exists', () => {
    before(() => {
      email = 'doesnotexist@environment-agency.gov.uk'
    })

    it('returns "false"', async () => {
      const result = await CheckEmailExistsDal.go(email)

      expect(result).to.be.false()
    })
  })
})
