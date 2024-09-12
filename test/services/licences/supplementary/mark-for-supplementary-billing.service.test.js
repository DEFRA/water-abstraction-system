'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const MarkForSupplementaryBillingService = require('../../../../app/services/licences/supplementary/mark-for-supplementary-billing.service.js')

describe('Mark For Supplementary Billing Service', () => {
  let testDate
  let clock

  beforeEach(() => {
    testDate = new Date('2024-04-01')
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    Sinon.restore()
    clock.restore()
  })

  describe('when called with a valid licence ID', () => {
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('returns page data for the view', async () => {
      const result = await MarkForSupplementaryBillingService.go(licence.id)

      // NOTE: The service mainly just regurgitates what the MarkForSupplementaryBillingPresenter returns. So, we don't
      // diligently check each property of the result because we know this will have been covered by the
      // MarkForSupplementaryBillingPresenter
      expect(result.licenceId).to.equal(licence.id)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.financialYears).to.equal([
        { text: '2024 to 2025', value: 2025 },
        { text: '2023 to 2024', value: 2024 },
        { text: '2022 to 2023', value: 2023 },
        { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
      ])
    })
  })
})
