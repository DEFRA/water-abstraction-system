'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
// const Sinon = require('sinon')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/return-requirements/fetch-licence.service.js')

describe.only('FetchLicenceService', () => {
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('go', () => {
    beforeEach(async () => {
      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        revokedDate: null
      })
    })

    it('fetches licence data correctly', async () => {
      const result = await FetchLicenceService.go(licence.licenceId)
      console.log('--------RESULT--------', result)

      expect(result.ends).to.be.null()
      expect(result.expiredDate).to.equal(null)
      expect(result.id).to.equal(licence.id)
      expect(result.lapsedDate).to.equal(null)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.revokedDate).to.equal(null)
      expect(result.startDate).to.equal(licence.startDate)
    })
  })
})
