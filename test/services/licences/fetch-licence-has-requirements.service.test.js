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
const FetchLicenceHasRequirementsService =
  require('../../../app/services/licences/fetch-licence-has-requirements.service.js')

describe.only('Fetch Licence Has Requirements service', () => {
  let returnVersion

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when the licence has return versions data', () => {
    beforeEach(async () => {
      returnVersion = await ReturnVersionHelper.add()
    })

    it('returns true a licence has any return versions', async () => {
      const result = await FetchLicenceHasRequirementsService.go(returnVersion.licenceId)

      expect(result).to.be.true()
    })

    it('returns false no return versions for licence', async () => {
      const result = await FetchLicenceHasRequirementsService.go('ed3b9b1a-94e0-480c-8ad6-60e05f5fa9f4')

      expect(result).to.be.false()
    })
  })
})
