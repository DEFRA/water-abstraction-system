'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const UserModel = require('../../../app/models/user.model.js')
const UsersFixture = require('../../support/fixtures/users.fixture.js')

// Thing under test
const FetchExternalUserService = require('../../../app/services/users/fetch-external-user.service.js')

// NOTE: The users are seeded as part of setting up the test database, along with with their groups and roles. So, we
// only create the related records.
describe('Users - Fetch External User service', () => {
  let companyEntity
  let licence
  let licenceDocumentHeader
  let user
  let userEntity

  before(async () => {
    user = UsersFixture.external()
    userEntity = await LicenceEntityHelper.add({ name: user.username, type: 'individual' })
    await UserModel.query().findById(user.id).patch({ licenceEntityId: userEntity.id })
    companyEntity = await LicenceEntityHelper.add({ name: 'Company 1', type: 'company' })
    await LicenceEntityRoleHelper.add({
      licenceEntityId: userEntity.id,
      companyEntityId: companyEntity.id,
      role: 'primary_user'
    })
    licence = await LicenceHelper.add({ licenceRef: 'FE/TC/H/US/ER/01' })
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      companyEntityId: companyEntity.id,
      licenceRef: 'FE/TC/H/US/ER/01'
    })
  })

  after(async () => {
    user = UsersFixture.external()
    await UserModel.query().findById(user.id).patch({ licenceEntityId: null })
  })

  describe('when called', () => {
    beforeEach(() => {
      user = UsersFixture.external()
    })

    it('returns the requested user', async () => {
      const result = await FetchExternalUserService.go(user.id)
      expect(result).to.equal({
        enabled: user.enabled,
        id: user.id,
        lastLogin: user.lastLogin,
        licenceEntity: {
          id: userEntity.id,
          licenceEntityRoles: [
            {
              companyEntity: {
                licenceDocumentHeaders: [
                  {
                    licence: { id: licence.id },
                    licenceRef: 'FE/TC/H/US/ER/01',
                    metadata: licenceDocumentHeader.metadata
                  }
                ],
                name: 'Company 1'
              },
              companyEntityId: companyEntity.id,
              role: 'primary_user'
            }
          ]
        },
        statusPassword: null,
        username: user.username
      })
    })
  })
})
