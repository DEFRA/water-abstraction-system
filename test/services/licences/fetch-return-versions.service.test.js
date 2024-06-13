'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchReturnVersionsService =
  require('../../../app/services/licences/fetch-return-versions.service.js')

describe('Fetch Return Versions service', () => {
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has return versions data', () => {
    beforeEach(async () => {
      returnVersion = await ReturnVersionHelper.add()
    })

    it('returns the matching return versions data', async () => {
      const result = await FetchReturnVersionsService.go(returnVersion.licenceId)

      expect(result).to.equal([
        {
          id: returnVersion.id,
          startDate: new Date('2022-04-01'),
          endDate: null,
          status: 'current',
          reason: 'new-licence'
        }
      ])
    })
  })
})
