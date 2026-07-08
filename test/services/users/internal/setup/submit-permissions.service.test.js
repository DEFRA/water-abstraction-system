// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import FetchUserDetailsDal from '../../../../../app/dal/users/internal/fetch-user-details.dal.js'

// Thing under test
import SubmitPermissionsService from '../../../../../app/services/users/internal/setup/submit-permissions.service.js'

describe('Users - Internal - Setup - Submit Permissions Service', () => {
  let auth
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    auth = { credentials: { user: { id: 1 } } }

    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.mock('../../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    const currentUserPermissions = 'billing_and_data'

    vi.mock('../../../../../app/dal/users/internal/fetch-user-details.dal.js')
    FetchUserDetailsDal.mockResolvedValue({
      $permissions: () => {
        return { key: currentUserPermissions }
      }
    })

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid payload', () => {
    beforeEach(() => {
      payload = { permission: 'basic' }
    })

    it('saves the submitted value', async () => {
      await SubmitPermissionsService(auth, session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        permission: 'basic'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitPermissionsService(auth, session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/users/internal/setup/${session.id}/check`
      })
    })

    describe('and the check page has', () => {
      describe('been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true,
            permission: 'basic'
          })

          FetchSessionDal.mockResolvedValue(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            beforeEach(() => {
              payload = { permission: 'basic' }
            })

            it('does not set a notification', async () => {
              await SubmitPermissionsService(auth, session.id, payload, yarStub)

              expect(yarStub.flash).not.toHaveBeenCalled()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { permission: 'super' }
            })

            it('sets a notification', async () => {
              await SubmitPermissionsService(auth, session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Permissions updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitPermissionsService(auth, session.id, payload, yarStub)

          expect(yarStub.flash).not.toHaveBeenCalled()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitPermissionsService(auth, session.id, payload, yarStub)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/email`,
          text: 'Back'
        },
        error: {
          permission: {
            text: 'Select permissions for the user'
          },
          errorList: [
            {
              href: '#permission',
              text: 'Select permissions for the user'
            }
          ]
        },
        pageTitle: 'Select permissions for the user',
        pageTitleCaption: 'Internal',
        permission: undefined,
        showSuperPermission: false
      })
    })
  })
})
