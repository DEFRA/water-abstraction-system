'use strict'

// Test framework dependencies
const { describe, it, beforeEach, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const { closeConnection } = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const MarkedForSupplementaryBillingService = require('../../../../app/services/licences/supplementary/marked-for-supplementary-billing.service.js')

describe('Marked For Supplementary Billing Service', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when called with a valid licence ID', () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns page data for the view', async () => {
      const result = await MarkedForSupplementaryBillingService.go(licence.id)

      expect(result.licenceId).to.equal(licence.id)
      expect(result.licenceRef).to.equal(licence.licenceRef)
    })
  })
})
