'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitAbstractionAlertsService = require('../../../../app/services/company-contacts/setup/submit-abstraction-alerts.service.js')

describe('Company Contacts - Setup - Abstraction Alerts Service', () => {
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    payload = { abstractionAlerts: 'yes' }
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitAbstractionAlertsService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal(session)
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
        activeNavBar: 'search',
        backLink: {
          href: '',
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#abstractionAlerts',
              text: '"abstractionAlerts" is required'
            }
          ],
          abstractionAlerts: {
            text: '"abstractionAlerts" is required'
          }
        },
        pageTitle: ''
      })
    })
  })
})
