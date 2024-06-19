'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const GenerateBillRunService = require('../../../../app/services/bill-runs/two-part-tariff/generate-bill-run.service.js')

describe('Generate Bill Run Service', () => {
  const billRunId = 'efe4d4b3-cca6-47ba-bcf6-9b848ffb535c'

  describe('when called', () => {
    it('returns the bill run ID passed to it', async () => {
      const result = await GenerateBillRunService.go(billRunId)

      expect(result).to.equal(billRunId)
    })
  })
})
