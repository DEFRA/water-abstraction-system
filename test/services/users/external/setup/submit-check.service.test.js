// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import UserSessionsFixture from '../../../../support/fixtures/user-sessions.fixture.js'
import YarStub from '../../../../support/stubs/yar.stub.js'
import { generateUUID } from '../../../../../app/lib/general.lib.js'

// Things we need to stub
import * as DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import * as UnregisterLicencesDal from '../../../../../app/dal/users/external/setup/unregister-licences.dal.js'

// Thing under test
import SubmitCheckService from '../../../../../app/services/users/external/setup/submit-check.service.js'

describe('Users - External - Setup - Submit Check Service', () => {
  let auth
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: generateUUID() } } }

    sessionData = UserSessionsFixture.unregistrationSession()
    sessionData.allLicences = true

    session = SessionModelStub(sessionData)

    vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
    vi.spyOn(UnregisterLicencesDal, 'default').mockResolvedValue()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('deletes the session record', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      expect(DeleteSessionDal.default).toHaveBeenCalledWith(session.id)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService(session.id, yarStub, auth)

      expect(result).toEqual({
        redirectUrl: `/system/users/external/${session.user.id}/licences?back=${session.activeNavBar}`
      })
    })

    it('unregisters the selected licences', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      expect(UnregisterLicencesDal.default).toHaveBeenCalledWith(session, auth.credentials.user)
    })

    it('sets a notification', async () => {
      await SubmitCheckService(session.id, yarStub, auth)

      const [flashType, notificationData] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notificationData).toEqual({
        titleText: 'Updated',
        text: 'Licences unregistered.'
      })
    })
  })
})
