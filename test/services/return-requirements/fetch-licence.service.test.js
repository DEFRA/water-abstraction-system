'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/return-requirements/fetch-licence.service.js')

describe('FetchLicenceService', () => {
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('go', () => {
    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    it('fetches licence data correctly', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.ends).to.be.null()
      expect(result.expiredDate).to.equal(null)
      expect(result.lapsedDate).to.equal(null)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.revokedDate).to.equal(null)
      expect(result.startDate).to.equal(licence.startDate)
    })
  })
})
