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
const SubmitAbstractionAlertsService = require('../../../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js')

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let company
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { abstractionAlerts: 'yes' }

    session = await SessionHelper.add({ data: sessionData })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionAlertsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: { ...session.data, abstractionAlerts: 'yes' },
        abstractionAlerts: 'yes'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitAbstractionAlertsService.go(session.id, payload)

      expect(result).to.equal({
        redirectUrl: `/system/company-contacts/setup/${session.id}/check`
      })
    })

    describe('when the check page has', () => {
      describe('been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              ...sessionData,
              checkPageVisited: true,
              abstractionAlerts: 'yes'
            }
          })
        })

        describe('and the "session" and "payload" value', () => {
          describe('match', () => {
            it('does not set a notification', async () => {
              await SubmitAbstractionAlertsService.go(session.id, payload, yarStub)

              expect(yarStub.flash.called).to.be.false()
            })
          })

          describe('do not match', () => {
            beforeEach(() => {
              payload = { abstractionAlerts: 'no' }
            })

            it('sets a notification', async () => {
              await SubmitAbstractionAlertsService.go(session.id, payload, yarStub)

              const [flashType, bannerMessage] = yarStub.flash.args[0]

              expect(flashType).to.equal('notification')
              expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Water abstraction alerts updated' })
            })
          })
        })
      })

      describe('not been visited', () => {
        it('does not set a notification', async () => {
          await SubmitAbstractionAlertsService.go(session.id, payload, yarStub)

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
      const result = await SubmitAbstractionAlertsService.go(session.id, payload)

      expect(result).to.equal({
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
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
