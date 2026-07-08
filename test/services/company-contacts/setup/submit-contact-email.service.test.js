// Test framework dependencies

// Test helpers
import * as CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitContactEmailService from '../../../../app/services/company-contacts/setup/submit-contact-email.service.js'

describe('Company Contacts - Setup - Contact Email Service', () => {
  let company
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { email: 'ERic@test.Com' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactEmailService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        email: 'eric@test.com'
      })
      expect(session.$update.called).toBe(true)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactEmailService(session.id, payload, yarStub)

      expect(result).toEqual({
        redirectUrl: `/system/company-contacts/setup/${session.id}/abstraction-alerts`
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(async () => {
          session = SessionModelStub({
            ...sessionData,
            checkPageVisited: true,
            email: 'eric@test.com'
          })

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitContactEmailService(session.id, payload, yarStub)

              expect(yarStub.flash).not.toHaveBeenCalled()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { email: 'bob@test.com' }
            })

            it('sets a notification', async () => {
              await SubmitContactEmailService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Email address updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitContactEmailService(session.id, payload, yarStub)

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
      const result = await SubmitContactEmailService(session.id, payload, yarStub)

      expect(result).toEqual({
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-name`,
          text: 'Back'
        },
        email: null,
        error: {
          email: {
            text: 'Enter an email address for the contact'
          },
          errorList: [
            {
              href: '#email',
              text: 'Enter an email address for the contact'
            }
          ]
        },
        pageTitle: 'Enter an email address for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
