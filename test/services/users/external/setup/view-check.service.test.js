// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ViewCheckService from '../../../../../src/services/users/external/setup/view-check.service.js'

describe('Users - External - Setup - View Check Service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([{ title: 'Updated', text: 'Licences unregistered.' }])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCheckService(session.id, yarStub)

      expect(result).toEqual({
        activeNavBar: 'users',
        licences: ['All licences'],
        links: {
          cancel: `/system/users/external/setup/${session.id}/cancel`,
          licences: `/system/users/external/setup/${session.id}/licences`
        },
        notification: {
          text: 'Licences unregistered.',
          title: 'Updated'
        },
        pageTitle: 'Check licences to unregister',
        pageTitleCaption: session.user.username,
        warning: {
          iconFallbackText: 'Warning',
          text: 'All these licences will no longer be accessible to existing users.'
        }
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

      it('displays the notification', async () => {
        const result = await ViewCheckService(session.id, yarStub)

        expect(result.notification).toEqual('Test notification')
      })
    })
  })
})
