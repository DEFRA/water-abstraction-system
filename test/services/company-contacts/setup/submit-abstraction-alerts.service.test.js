'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
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

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { abstractionAlerts: 'yes' }

    session = await SessionHelper.add({ data: sessionData })
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

      expect(result).to.equal({})
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
        activeNavBar: 'search',
        backLink: {
          href: `/system/company-contacts/setup/${session.id}/contact-email`,

          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#abstractionAlerts',
              text: 'Select should the contact get water abstraction alerts'
            }
          ],
          abstractionAlerts: {
            text: 'Select should the contact get water abstraction alerts'
          }
        },
        pageTitle: 'Should the contact get abstraction alerts?',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
