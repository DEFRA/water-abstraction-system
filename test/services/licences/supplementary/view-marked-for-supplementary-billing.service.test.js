'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const ViewMarkedForSupplementaryBillingService = require('../../../../app/services/licences/supplementary/view-marked-for-supplementary-billing.service.js')

describe('Licences -  View Marked For Supplementary Billing Service', () => {
  describe('when called with a valid licence ID', () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns page data for the view', async () => {
      const result = await ViewMarkedForSupplementaryBillingService.go(licence.id)

      expect(result).to.equal({
        licenceRef: licence.licenceRef,
        pageTitle: "You've marked this licence for the next supplementary bill run",
        redirectLink: `/system/licences/${licence.id}/set-up`
      })
    })
  })
})
