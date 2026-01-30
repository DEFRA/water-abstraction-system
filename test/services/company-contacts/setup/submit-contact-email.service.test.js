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
const SubmitContactEmailService = require('../../../../app/services/company-contacts/setup/submit-contact-email.service.js')

describe('Company Contacts - Setup - Contact Email Service', () => {
  let company
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { email: 'eric@test.com' }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactEmailService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: { ...session.data, email: 'eric@test.com' },
        email: 'eric@test.com'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactEmailService.go(session.id, payload)

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
