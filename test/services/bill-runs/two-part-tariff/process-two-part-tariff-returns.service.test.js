'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const ProcessTwoPartTariffReturnsService = require('../../../../app/services/bill-runs/two-part-tariff/process-two-part-tariff-returns.service.js')

describe('Process Two Part Tariff Returns service', () => {
  describe('when the service is called', () => {
    const billingPeriods = [{ endDate: new Date('2023-03-31') }]

    it('does stuff', async () => {
      const result = await expect(ProcessTwoPartTariffReturnsService.go('billRun', billingPeriods))

      expect(result).to.equal(result) // TODO: Add proper validation of result
    })
  })
})
