'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const LicencesService = require('../../../app/services/customers/licences.service.js')

describe('Customers - Licences Service', () => {
  let customerId

  beforeEach(() => {
    customerId = generateUUID()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await LicencesService.go(customerId)

      expect(result).to.equal({
        activeTab: 'search',
        backLink: {
          href: '/',
          text: 'Back to search'
        },
        pageTitle: 'Licences'
      })
    })
  })
})
