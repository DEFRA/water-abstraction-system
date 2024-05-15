'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')

// Thing under test
const FetchCommunicationsService =
  require('../../../app/services/licences/fetch-communications.service.js')

describe('Fetch Communications service', () => {
  let licenceId

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has communications', () => {
    beforeEach(async () => {
    })

    it('returns the matching licence customer contacts', async () => {
      const results = await FetchCommunicationsService.go(licenceId)

      expect(results).to.equal([])
    })
  })
})
