'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers

// Thing under test
const FetchLicenceSetUpService =
  require('../../../app/services/licences/fetch-licence-set-up.service.js')

describe('Fetch licence set up', () => {
  describe('when the licence has set up data', () => {
    it('returns the matching set up data', async () => {
      const result = await FetchLicenceSetUpService.go()

      expect(result).to.be.empty()
    })
  })
})
