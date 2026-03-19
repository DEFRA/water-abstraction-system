'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before, after } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceDocumentHeaderHelper = require('../../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const UserHelper = require('../../../support/helpers/user.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const FetchUserService = require('../../../../app/services/users/external/fetch-user.service.js')

describe('Users - External - Fetch User service', () => {
  let licence
  let licenceDocumentHeader
  let licenceEntityRole
  let user
  let userEntity

  before(async () => {
    const companyEntityId = generateUUID()

    userEntity = await LicenceEntityHelper.add()
    user = await UserHelper.add({ application: 'water_vml', licenceEntityId: userEntity.id, username: userEntity.name })

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      licenceEntityId: userEntity.id,
      companyEntityId,
      role: 'primary_user'
    })

    licence = await LicenceHelper.add()
    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({ companyEntityId, licenceRef: licence.licenceRef })
  })

  after(async () => {
    await licenceDocumentHeader.$query().delete()
    await licence.$query().delete()
    await licenceEntityRole.$query().delete()
    await user.$query().delete()
    await userEntity.$query().delete()
  })

  describe('when called', () => {
    it('returns the requested user', async () => {
      const result = await FetchUserService.go(user.id)

      expect(result).to.equal({
        application: user.application,
        enabled: user.enabled,
        groups: [],
        id: user.id,
        lastLogin: user.lastLogin,
        licenceEntity: {
          id: userEntity.id,
          licenceEntityRoles: [
            {
              id: licenceEntityRole.id,
              role: 'primary_user'
            }
          ]
        },
        licenceEntityId: user.licenceEntityId,
        roles: [],
        statusPassword: null,
        username: user.username
      })
    })
  })
})
