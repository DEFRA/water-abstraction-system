'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const ViewManageService = require('../../../app/services/customers-contacts/view-manage.service.js')

describe('Customers contacts - View Manage Service', () => {
  let customerId
  let contactId

  beforeEach(async () => {
    customerId = generateUUID()
    contactId = generateUUID()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewManageService.go(customerId, contactId)

      expect(result).to.equal({
        backLink: {
          href: '/system/search',
          text: 'Back'
        },
        pageTitle: 'Manage contact settings for'
      })
    })
  })
})
