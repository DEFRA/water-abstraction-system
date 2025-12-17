'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ContactsService = require('../../../app/services/customers/contacts.service.js')

describe('Customers - Contacts Service', () => {
  let customerId

  beforeEach(async () => {
    customerId = generateUUID()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ContactsService.go(customerId)

      expect(result).to.equal({
        activeNavBar: 'search',
        activeSecondaryNav: 'contacts',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Contacts'
      })
    })
  })
})
