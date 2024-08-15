'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchLicenceHistoryService = require('../../../app/services/licences/fetch-licence-history.service.js')

describe('Fetch Licence History service', () => {
  let licenceId

  describe('when the licence has contact details', () => {
    beforeEach(async () => {
      const licence = await LicenceHelper.add()

      licenceId = licence.id

      const { licenceRef } = licence

      const chargeVersions = await ChargeVersionHelper.add({ licenceId, licenceRef })
      const LicenceVersions = await LicenceVersionHelper.add({ licenceId })
      const ReturnVersions = await ReturnVersionHelper.add({ licenceId })
    })

    it('returns the matching licence versions, charge versions and return versions', async () => {
      const result = await FetchLicenceHistoryService.go(licenceId)

      expect(result).to.equal({

      })
    })
  })
})
