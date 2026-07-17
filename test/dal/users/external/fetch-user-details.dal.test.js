// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceDocumentHeaderHelper from '../../../support/helpers/licence-document-header.helper.js'
import LicenceEntityHelper from '../../../support/helpers/licence-entity.helper.js'
import LicenceEntityRoleHelper from '../../../support/helpers/licence-entity-role.helper.js'
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import UserHelper from '../../../support/helpers/user.helper.js'
import { generateUUID } from '../../../support/generators.js'

// Thing under test
import FetchUserDetailsDal from '../../../../app/dal/users/external/fetch-user-details.dal.js'

describe('Users - External - Fetch User Details DAL', () => {
  let licence
  let licenceDocumentHeader
  let licenceEntityRole
  let user
  let userEntity

  beforeAll(async () => {
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

  afterAll(async () => {
    await licenceDocumentHeader.$query().delete()
    await licence.$query().delete()
    await licenceEntityRole.$query().delete()
    await user.$query().delete()
    await userEntity.$query().delete()
  })

  describe('when called', () => {
    it('returns the requested user', async () => {
      const result = await FetchUserDetailsDal(user.id)

      expect(result).toEqual({
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
