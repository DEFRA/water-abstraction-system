'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const ReturnVersionHelper = require('../../support/helpers/return-version.helper.js')

// Thing under test
const FetchLicenceHasRequirementsService =
  require('../../../app/services/licences/determine-licence-has-return-versions.service.js')

describe('Fetch Licence Has Requirements service', () => {
  const licenceId = 'e004c0c9-0316-42fc-a6e3-5ae9a271b3c6'

  describe('when the licence has return versions', () => {
    beforeEach(async () => {
      await ReturnVersionHelper.add({ licenceId })
    })

    it('returns true', async () => {
      const result = await FetchLicenceHasRequirementsService.go(licenceId)

      expect(result).to.be.true()
    })
  })

  describe('when the licence does not have return versions', () => {
    it('returns false', async () => {
      const result = await FetchLicenceHasRequirementsService.go('ed3b9b1a-94e0-480c-8ad6-60e05f5fa9f4')

      expect(result).to.be.false()
    })
  })
})
