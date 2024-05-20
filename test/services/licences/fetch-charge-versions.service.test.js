'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const FetchChargeVersionsService =
  require('../../../app/services/licences/fetch-charge-versions.service.js')

describe('Fetch charge versions for a licence', () => {
  describe('when the licence has set up data', () => {
    it('returns the matching set up data', async () => {
      const result = await FetchChargeVersionsService.go()

      expect(result).to.be.empty()
    })
  })
})
