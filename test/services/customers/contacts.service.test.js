'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const ContactsService = require('../../../app/services/customers/contacts.service.js')

describe('Customers - Contacts Service', () => {
  let session
  let sessionData

  beforeEach(async () => {
    sessionData = {}

    session = await SessionHelper.add({ data: sessionData })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ContactsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Contacts'
      })
    })
  })
})
