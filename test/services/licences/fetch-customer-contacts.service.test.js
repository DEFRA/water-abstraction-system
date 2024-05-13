'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')

// Thing under test
const FetchCustomerContactDetailsService =
  require('../../../app/services/licences/fetch-customer-contacts.service.js')

describe('Fetch Customer Contacts service', () => {
  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has contact details', () => {
    beforeEach(async () => {
    })

    it('returns the matching licence contacts', async () => {
      const results = await FetchCustomerContactDetailsService.go()

      expect(results).to.equal({})
    })
  })
})
