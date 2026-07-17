// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewEmailService from '../../../../../app/services/users/internal/setup/view-email.service.js'

describe('Users - Internal - Setup - View Email Service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewEmailService(session.id)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: '/system/users',
          text: 'Back'
        },
        email: null,
        pageTitle: 'Enter an email address for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
