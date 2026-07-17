// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import * as FetchUserDetailsDal from '../../../../../app/dal/users/internal/fetch-user-details.dal.js'

// Thing under test
import ViewPermissionsService from '../../../../../app/services/users/internal/setup/view-permissions.service.js'

describe('Users - Internal - Setup - View Permissions Service', () => {
  let auth
  let session
  let sessionData

  beforeEach(() => {
    auth = { credentials: { user: { id: 1 } } }

    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    const currentUserPermissions = 'super'

    vi.spyOn(FetchUserDetailsDal, 'default').mockResolvedValue({
      $permissions: () => {
        return { key: currentUserPermissions }
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewPermissionsService(auth, session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/email`,
          text: 'Back'
        },
        pageTitle: 'Select permissions for the user',
        pageTitleCaption: 'Internal',
        permission: undefined,
        showSuperPermission: true
      })
    })
  })
})
