'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const SessionModelStub = require('../../../../support/stubs/session.stub.js')
const YarStub = require('../../../../support/stubs/yar.stub.js')

// Things we need to stub
const CheckEmailExistsDal = require('../../../../../app/dal/users/check-email-exists.dal.js')
const FetchSessionDal = require('../../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitEmailService = require('../../../../../app/services/users/internal/setup/submit-email.service.js')

describe('Users - Internal - Setup - Submit Email Service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {}

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    Sinon.stub(CheckEmailExistsDal, 'go').resolves(false)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
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
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            checkPageVisited: true,
            email: 'bob@environment-agency.gov.uk'
          })

          fetchSessionStub.resolves(session)
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

              expect(yarStub.flash.called).toBe(false)
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { email: 'another.user@environment-agency.gov.uk' }
            })

            it('sets a notification', async () => {
              await SubmitEmailService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Email address updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitEmailService(session.id, payload, yarStub)

          expect(yarStub.flash.called).toBe(false)
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
