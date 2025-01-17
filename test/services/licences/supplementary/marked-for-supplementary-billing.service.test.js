'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const MarkedForSupplementaryBillingService = require('../../../../app/services/licences/supplementary/marked-for-supplementary-billing.service.js')

describe('Marked For Supplementary Billing Service', () => {
  describe('when called with a valid licence ID', () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns page data for the view', async () => {
      const result = await MarkedForSupplementaryBillingService.go(licence.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        licenceId: licence.id,
        licenceRef: licence.licenceRef,
        pageTitle: "You've marked this licence for the next supplementary bill run"
      })
    })
  })
})
