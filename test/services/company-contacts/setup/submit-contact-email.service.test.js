'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitContactEmailService = require('../../../../app/services/company-contacts/setup/submit-contact-email.service.js')

describe('Company Contacts - Setup - Contact Email Service', () => {
  let company
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { email: 'ERic@test.Com' }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactEmailService.go(session.id, payload, yarStub)

      expect(session).to.equal({
        ...session,
        email: 'eric@test.com'
      })
      expect(session.$update.called).to.be.true()
    })

    it('continues the journey', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload, yarStub)

      expect(result).to.equal({
        redirectUrl: `/system/company-contacts/setup/${session.id}/abstraction-alerts`
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(async () => {
          session = SessionModelStub.build(Sinon, {
            ...sessionData,
            checkPageVisited: true,
            email: 'eric@test.com'
          })

          fetchSessionStub.resolves(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitContactEmailService.go(session.id, payload, yarStub)

              expect(yarStub.flash.called).to.be.false()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { email: 'bob@test.com' }
            })

            it('sets a notification', async () => {
              await SubmitContactEmailService.go(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).to.equal('notification')
              expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Email address updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitContactEmailService.go(session.id, payload, yarStub)

          expect(yarStub.flash.called).to.be.false()
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload, yarStub)

      expect(result).to.equal({
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
