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
const SubmitContactNameService = require('../../../../app/services/company-contacts/setup/submit-contact-name.service.js')

describe('Company Contacts - Setup - Contact Name Service', () => {
  let company
  let payload
  let session
  let sessionData

  beforeEach(async () => {
    company = CustomersFixtures.company()

    sessionData = { company }

    payload = { name: 'Eric' }

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitContactNameService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession).to.equal({
        ...session,
        data: { ...session.data, name: 'Eric' },
        name: 'Eric'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitContactNameService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactNameService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Back'
        },
        error: {
          errorList: [
            {
              href: '#name',
              text: 'Enter a name for the contact'
            }
          ],
          name: {
            text: 'Enter a name for the contact'
          }
        },
        name: '',
        pageTitle: 'Enter a name for the contact',
        pageTitleCaption: 'Tyrell Corporation'
      })
    })
  })
})
