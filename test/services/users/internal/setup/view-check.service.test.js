// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckService from '../../../../../app/services/users/internal/setup/view-check.service.js'

describe('Users - Internal - Setup - Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      email: 'bob.bobbles@environment-agency.gov.uk',
      permission: 'billing_and_data'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = { flash: vi.fn().mockReturnValue([]) }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService(session.id, yarStub)

      expect(result).toEqual({
        access: null,
        activeNavBar: 'users',
        email: session.email,
        links: {
          access: `/system/users/internal/setup/${session.id}/access`,
          cancel: `/system/users/internal/setup/${session.id}/cancel`,
          email: `/system/users/internal/setup/${session.id}/email`,
          permissions: `/system/users/internal/setup/${session.id}/permissions`
        },
        notification: undefined,
        pageTitle: 'Check user',
        pageTitleCaption: 'Internal',
        permission: 'Billing and Data',
        showEmailChangeLink: true
      })
    })

    it('sets the "checkPageVisited" flag to "true"', async () => {
      await ViewCheckService(session.id, yarStub)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update).toHaveBeenCalled()
    })

    describe('when there is a notification', () => {
      beforeEach(() => {
        yarStub = { flash: vi.fn().mockReturnValue(['Test notification']) }
      })

      it('sets the notification', async () => {
        const result = await ViewCheckService(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
