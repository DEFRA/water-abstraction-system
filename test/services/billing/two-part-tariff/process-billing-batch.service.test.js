'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const TwoPartTariffProcessBillingBatchService = require('../../../../app/services/billing/two-part-tariff/process-billing-batch.service.js')

describe('Two Part Tariff Process billing batch service', () => {
  describe('when the service is called', () => {
    it('throws an error', async () => {
      const error = await expect(TwoPartTariffProcessBillingBatchService.go()).to.reject()

      expect(error).to.be.an.instanceOf(Error)
      expect(error.message).to.equal('Two Part Tariff is not yet implemented')
    })
  })
})
