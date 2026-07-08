'use strict'

// Test framework dependencies
const Sinon = require('sinon')

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const SessionModelStub = require('../../../support/stubs/session.stub.js')
const YarStub = require('../../../support/stubs/yar.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitAbstractionAlertsService = require('../../../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js')

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let company
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company, licences: [] }

    payload = { abstractionAlerts: 'yes' }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = YarStub.build(Sinon)
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionAlertsService(session.id, payload, yarStub)

      expect(session).toEqual({
        ...session,
        abstractionAlerts: 'yes'
      })
      expect(session.$update.called).toBe(true)
    })

    describe('the redirect URL', () => {
      describe('when "abstractionAlerts" is "yes"', () => {
        it('redirects to the check page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/check` })
        })
      })

      describe('when "abstractionAlerts" is "no"', () => {
        beforeEach(() => {
          payload = { abstractionAlerts: 'no' }
        })

        it('redirects to the check page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/check` })
        })
      })

      describe('when "abstractionAlerts" is "some"', () => {
        beforeEach(() => {
          payload = { abstractionAlerts: 'some' }
        })

        it('redirects to the licences page', async () => {
          const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

          expect(result).toEqual({ redirectUrl: `/system/company-contacts/setup/${session.id}/licences` })
        })
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(async () => {
          sessionData = {
            ...sessionData,
            checkPageVisited: true,
            abstractionAlerts: 'yes'
          }

          session = SessionModelStub.build(Sinon, sessionData)

          fetchSessionStub.resolves(session)
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitAbstractionAlertsService(session.id, payload, yarStub)

              expect(yarStub.flash.called).toBe(false)
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { abstractionAlerts: 'no' }
            })

            it('sets a notification', async () => {
              await SubmitAbstractionAlertsService(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).toEqual('notification')
              expect(bannerMessage).toEqual({ titleText: 'Updated', text: 'Water abstraction alerts updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitAbstractionAlertsService(session.id, payload, yarStub)

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
      const result = await SubmitAbstractionAlertsService(session.id, payload, yarStub)

      expect(result).toEqual({
        abstractionAlerts: null,
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,

          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#abstractionAlerts',
              text: 'Should the contact get water abstraction alerts'
            }
          ],
          abstractionAlerts: {
            text: 'Should the contact get water abstraction alerts'
          }
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation',
        showSomeLicences: false
      })
    })
  })
})
