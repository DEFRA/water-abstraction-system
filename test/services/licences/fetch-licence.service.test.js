'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Fetch licence service', () => {
  let licence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there is no optional data in the model', () => {
    beforeEach(async () => {
      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id,
        revokedDate: null
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
      })
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2022-05-01')
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)
    })

    it('returns results', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.expiredDate).to.equal(null)
      expect(result.lapsedDate).to.equal(null)
      expect(result.region.displayName).to.equal('Avalon')
      expect(result.revokedDate).to.equal(null)
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.licenceHolder).to.equal('Licence Holder Ltd')
    })
  })
})
