'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')

// Thing under test
const FetchHistoryService = require('../../../app/services/licences/fetch-history.service.js')

describe('Licences - Fetch History service', () => {
  let licence
  let licenceId
  let licenceVersion

  describe('when the licence has licence versions, charge versions and return versions', () => {
    before(async () => {
      licence = await LicenceHelper.add()

      licenceId = licence.id

      licenceVersion = await LicenceVersionHelper.add({ licenceId })
    })

    it('returns the matching licence versions, charge versions and return versions', async () => {
      const result = await FetchHistoryService.go(licenceId)

      expect(result).to.equal({
        id: licence.id,
        licenceVersions: [
          {
            endDate: licenceVersion.endDate,
            id: licenceVersion.id,
            startDate: licenceVersion.startDate
          }
        ]
      })
    })
  })
})
