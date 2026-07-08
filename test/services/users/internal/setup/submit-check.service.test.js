// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import CreateUserDal from '../../../../../app/dal/users/internal/create-user.dal.js'
import CreateVerificationNotificationDal from '../../../../../app/dal/users/internal/create-verification-notification.dal.js'
import DeleteSessionDal from '../../../../../app/dal/delete-session.dal.js'
import FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import SendVerificationEmailService from '../../../../../app/services/users/internal/setup/send-verification-email.service.js'
import UpdateUserDal from '../../../../../app/dal/users/internal/update-user.dal.js'

// Thing under test
import SubmitCheckService from '../../../../../app/services/users/internal/setup/submit-check.service.js'

describe('Users - Internal - Setup - Submit Check Service', () => {
  let auth
  let notification
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: '89b25863-918f-484f-b7fa-49f7062b4af3' } } }

    vi.mock('../../../../../app/dal/delete-session.dal.js')
    DeleteSessionDal.mockResolvedValue()
    vi.mock('../../../../../app/services/users/internal/setup/send-verification-email.service.js')
    SendVerificationEmailService.mockResolvedValue()

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when creating a user', () => {
    const resetGuid = '8f5123e3-a982-40c1-843c-b6ef09b1c6bd'

    beforeEach(() => {
      notification = {
        id: '06a30477-fbdc-4e62-8f1a-1b6f9b83a454',
        messageRef: 'new_internal_user_email',
        messageType: 'email',
        personalisation: {
          unique_create_password_link: `https://internal.com/reset_password_change_password?resetGuid=${resetGuid}`
        },
        recipient: 'bob.bobbles@environment-agency.gov.uk'
      }

      sessionData = _createSessionData()

      session = SessionModelStub(sessionData)

      vi.mock('../../../../../app/dal/users/internal/create-user.dal.js')
      CreateUserDal.mockResolvedValue(resetGuid)
      vi.mock('../../../../../app/dal/users/internal/create-verification-notification.dal.js')
      CreateVerificationNotificationDal.mockResolvedValue(notification)
      vi.mock('../../../../../app/dal/fetch-session.dal.js')
      FetchSessionDal.mockResolvedValue(session)
    })

    it('deletes the session', async () => {
      await SubmitCheckService(auth, session.id, yarStub)

      expect(DeleteSessionDal.go).toHaveBeenCalledWith(session.id)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService(auth, session.id, yarStub)

      expect(result).toEqual({ redirectUrl: '/system/users' })
    })

    it('sets a notification', async () => {
      await SubmitCheckService(auth, session.id, yarStub)

      const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({
        titleText: 'User added',
        text: `We have emailed ${session.email} instructions to complete their account set up.`
      })
    })

    it('sends a verification email', async () => {
      await SubmitCheckService(auth, session.id, yarStub)

      expect(SendVerificationEmailService.go).toHaveBeenCalledWith(notification)
    })
  })

  describe('when updating a user', () => {
    beforeEach(() => {
      sessionData = _updateSessionData()

      session = SessionModelStub(sessionData)

      vi.mock('../../../../../app/dal/fetch-session.dal.js')
      FetchSessionDal.mockResolvedValue(session)
      vi.mock('../../../../../app/dal/users/internal/update-user.dal.js')
      UpdateUserDal.mockResolvedValue(null)
    })

    it('returns the redirect URL', async () => {
      const result = await SubmitCheckService(auth, session.id, yarStub)

      expect(result).toEqual({ redirectUrl: '/system/users' })
    })

    describe('when the email has changed', () => {
      const newResetGuid = '4695078b-1f09-4cb9-80ab-15528d2718d4'

      beforeEach(() => {
        notification = {
          id: 'c3a7b2d1-e4f5-4a6b-8c9d-0e1f2a3b4c5d',
          messageRef: 'new_internal_user_email',
          messageType: 'email',
          personalisation: {
            unique_create_password_link: `https://internal.com/reset_password_change_password?resetGuid=${newResetGuid}`
          },
          recipient: 'bob.bobbles@environment-agency.gov.uk'
        }

        UpdateUserDal.mockResolvedValue(newResetGuid)

        vi.mock('../../../../../app/dal/users/internal/create-verification-notification.dal.js')
        CreateVerificationNotificationDal.mockResolvedValue(notification)
      })

      it('creates a new password reset link', async () => {
        await SubmitCheckService(auth, session.id, yarStub)

        expect(CreateVerificationNotificationDal.go).toHaveBeenCalledWith(session.email, newResetGuid)
      })

      it('sets a notification', async () => {
        await SubmitCheckService(auth, session.id, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          titleText: 'User updated',
          text: `We have emailed ${session.email} instructions to complete their account set up.`
        })
      })

      it('sends a verification email', async () => {
        await SubmitCheckService(auth, session.id, yarStub)

        expect(SendVerificationEmailService.go).toHaveBeenCalledWith(notification)
      })
    })

    describe('when the email has not changed', () => {
      it('sets a notification', async () => {
        await SubmitCheckService(auth, session.id, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({
          titleText: 'User updated',
          text: `User ${session.email} has been updated.`
        })
      })

      it('does not send a verification email', async () => {
        await SubmitCheckService(auth, session.id, yarStub)

        expect(SendVerificationEmailService.go).not.toHaveBeenCalled()
      })
    })
  })
})

function _createSessionData() {
  return {
    email: 'bob.bobbles@environment-agency.gov.uk',
    permission: 'billing_and_data'
  }
}

function _updateSessionData() {
  return {
    email: 'bob.bobbles@environment-agency.gov.uk',
    permission: 'billing_and_data',
    user: {
      id: '89b25863-918f-484f-b7fa-49f7062b4af3',
      userId: 1234,
      username: 'bob.bobbles@environment-agency.gov.uk'
    }
  }
}
