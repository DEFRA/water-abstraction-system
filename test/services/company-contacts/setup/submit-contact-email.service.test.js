'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactEmailService = require('../../../../app/services/company-contacts/setup/submit-contact-email.service.js')

describe('Company Contacts - Setup - Contact Email Service', () => {
  let company
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { email: 'eric@test.com' }

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactEmailService.go(session.id, payload, yarStub)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: { ...session.data, email: 'eric@test.com' },
        email: 'eric@test.com'
      })
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
          session = await SessionHelper.add({
            data: {
              ...sessionData,
              checkPageVisited: true,
              email: 'eric@test.com'
            }
          })
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

            it('does not set a notification', async () => {
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
        email: '',
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
