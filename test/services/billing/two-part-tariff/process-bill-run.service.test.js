'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const TwoPartTariffProcessBillRunService = require('../../../../app/services/billing/two-part-tariff/process-bill-run.service.js')

describe('Two Part Tariff Process Bill Run service', () => {
  describe('when the service is called', () => {
    it('throws an error', async () => {
      const error = await expect(TwoPartTariffProcessBillRunService.go('billRun', 'billingPeriods', 2022)).to.reject()

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.equal('Two Part Tariff is not yet implemented for Financial Year Ending: 2022')
    })
  })
})
