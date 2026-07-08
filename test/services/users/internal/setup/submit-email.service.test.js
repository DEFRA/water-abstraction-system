// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'
import YarStub from '../../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as CheckEmailExistsDal from '../../../../../app/dal/users/check-email-exists.dal.js'
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitEmailService from '../../../../../app/services/users/internal/setup/submit-email.service.js'

describe('Users - Internal - Setup - Submit Email Service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    vi.spyOn(CheckEmailExistsDal, 'default').mockResolvedValue(false)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid payload', () => {
    beforeEach(() => {
      payload = { email: 'Bob@environment-agency.GOV.UK' }
    })

    it('saves the submitted value', async () => {
      await SubmitEmailService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        email: 'bob@environment-agency.gov.uk'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitEmailService(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/users/internal/setup/${session.id}/permissions`
      })
    })

    describe('and the check page has', () => {
      describe('been visited', () => {
        beforeEach(() => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true,
            email: 'bob@environment-agency.gov.uk'
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        it('redirects to the Check page', async () => {
          const result = await SubmitEmailService(session.id, payload, yarStub)

          expect(result).toEqual({
            redirectUrl: `/system/users/internal/setup/${session.id}/check`
          })
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitEmailService(session.id, payload, yarStub)

              expect(yarStub.flash).not.toHaveBeenCalled()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { email: 'another.user@environment-agency.gov.uk' }
            })

            it('sets a notification', async () => {
              await SubmitEmailService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Email address updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitEmailService(session.id, payload, yarStub)

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
      const result = await SubmitEmailService(session.id, payload, yarStub)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: '/system/users',
          text: 'Back'
        },
        email: null,
        error: {
          email: {
            text: 'Enter an email address for this user'
          },
          errorList: [
            {
              href: '#email',
              text: 'Enter an email address for this user'
            }
          ]
        },
        pageTitle: 'Enter an email address for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
