'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ProcessBillingPeriodService = require('../../../../app/services/bill-runs/tpt-supplementary/process-billing-period.service.js')

describe('Bill Runs - Two-part Tariff - Process Billing Period service', () => {
  describe('when the service is called', () => {
    it('throws an error', async () => {
      await expect(ProcessBillingPeriodService.go()).to.reject()
    })
  })
})
