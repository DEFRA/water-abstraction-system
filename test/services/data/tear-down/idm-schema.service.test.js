'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const UserHelper = require('../../../support/helpers/user.helper.js')

// Models
const UserModel = require('../../../../app/models/user.model.js')

// Thing under test
const IdmSchemaService = require('../../../../app/services/data/tear-down/idm-schema.service.js')

describe.only('IDM schema service', () => {
  describe('go', () => {
    let user

    beforeEach(async () => {
      // Use a unique username matching the '%@example.com' pattern recognised by the teardown
      user = await UserHelper.add({ username: `${generateUUID()}@example.com` })
    })

    it('removes all loaded IDM schema test data', async () => {
      await IdmSchemaService.go()

      expect(await UserModel.query().findById(user.id)).to.be.undefined()
    })
  })
})
