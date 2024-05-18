'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const PermitLicenceHelper = require('../../support/helpers/permit-licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchLicenceDetailsService = require('../../../app/services/return-requirements/fetch-licence-details.service')

describe('Fetch licence details service', () => {
  let licence

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is no optional data in the model', () => {
    beforeEach(async () => {
      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      // Create a licence holder for the licence with the default name 'Licence Holder Ltd'
      await LicenceHolderSeeder.seed(licence.licenceRef)
    })

    it('returns results', async () => {
      const result = await FetchLicenceDetailsService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.expiredDate).to.equal(null)
      expect(result.licenceVersions[0].purposes[0].description).to.equal('Spray Irrigation - Storage')
      expect(result.permitLicence).to.equal(null)
    })
  })

  describe('when there is optional data in the model', () => {
    beforeEach(async () => {
      const region = await RegionHelper.add()

      licence = await LicenceHelper.add({
        expiredDate: null,
        lapsedDate: null,
        regionId: region.id
      })

      // Create 2 licence versions so we can test the service only gets the 'current' version
      await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
      })
      const licenceVersion = await LicenceVersionHelper.add({
        licenceId: licence.id, startDate: new Date('2022-05-01')
      })

      const purpose = await PurposeHelper.add()
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      await PermitLicenceHelper.add({
        licenceRef: licence.licenceRef,
        licenceDataValue: {
          data: {
            current_version: {
              purposes: [{
                purposePoints: [{ point_source: { NAME: 'Ground water' } }]
              }]
            }
          }
        }
      })
    })

    it('returns results', async () => {
      const result = await FetchLicenceDetailsService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.expiredDate).to.equal(null)
      expect(result.licenceVersions[0].purposes[0].description).to.equal('Spray Irrigation - Storage')
      expect(result.permitLicence.purposes).to.equal([{
        purposePoints: [{ point_source: { NAME: 'Ground water' } }]
      }])
    })
  })
})
