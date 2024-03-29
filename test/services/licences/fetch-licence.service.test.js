'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const CompanyHelper = require('../../support/helpers/company.helper.js')
const DatabaseSupport = require('../../support/database.js')
const GaugingStationHelper = require('../../support/helpers/gauging-station.helper.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceDocumentHelper = require('../../support/helpers/licence-document.helper.js')
const LicenceDocumentRoleHelper = require('../../support/helpers/licence-document-role.helper.js')
const LicenceGaugingStationHelper = require('../../support/helpers/licence-gauging-station.helper.js')
const LicenceRoleHelper = require('../../support/helpers/licence-role.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const PermitLicenceHelper = require('../../support/helpers/permit-licence.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

describe('Fetch licence service', () => {
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
        regionId: region.id,
        revokedDate: null
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
      const result = await FetchLicenceService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.ends).to.equal(null)
      expect(result.expiredDate).to.equal(null)
      expect(result.lapsedDate).to.equal(null)
      expect(result.licenceHolder).to.equal('Licence Holder Ltd')
      expect(result.licenceName).to.equal('Unregistered licence')
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.licenceVersions[0].purposes[0].description).to.equal('Spray Irrigation - Storage')
      expect(result.region.displayName).to.equal('Avalon')
      expect(result.registeredTo).to.equal(null)
      expect(result.revokedDate).to.equal(null)
      expect(result.permitLicence).to.equal(null)
      expect(result.licenceGaugingStations).to.equal([])
    })
  })

  describe('when there is optional data in the model', () => {
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

      const licenceRole = await LicenceRoleHelper.add()
      const licenceName = 'Test Company Ltd'
      const companyEntityId = 'c960a4a1-94f9-4c05-9db1-a70ce5d08738'
      const licenceRef = licence.licenceRef

      const company = await CompanyHelper.add({ name: licenceName })

      const licenceDocument = await LicenceDocumentHelper.add({ licenceRef })

      await LicenceDocumentHeaderHelper.add({ companyEntityId, licenceName, licenceRef })
      const { id: licenceEntityId } = await LicenceEntityHelper.add()

      await LicenceEntityRoleHelper.add({ companyEntityId, licenceEntityId })

      await LicenceDocumentRoleHelper.add({
        licenceDocumentId: licenceDocument.id,
        licenceRoleId: licenceRole.id,
        companyId: company.id,
        startDate: new Date('2022-04-01')
      })

      const gaugingStation = await GaugingStationHelper.add({
        id: 'ac075651-4781-4e24-a684-b943b98607ca'
      })
      await LicenceGaugingStationHelper.add({
        gaugingStationId: gaugingStation.id,
        licenceId: licence.id
      })
    })

    it('returns results', async () => {
      const result = await FetchLicenceService.go(licence.id)

      expect(result.id).to.equal(licence.id)
      expect(result.ends).to.equal(null)
      expect(result.expiredDate).to.equal(null)
      expect(result.lapsedDate).to.equal(null)
      expect(result.licenceHolder).to.equal('Test Company Ltd')
      expect(result.licenceName).to.equal('Test Company Ltd')
      expect(result.licenceRef).to.equal(licence.licenceRef)
      expect(result.licenceVersions[0].purposes[0].description).to.equal('Spray Irrigation - Storage')
      expect(result.region.displayName).to.equal('Avalon')
      expect(result.registeredTo).to.equal('grace.hopper@example.com')
      expect(result.revokedDate).to.equal(null)
      expect(result.permitLicence.purposes).to.equal([{
        purposePoints: [{ point_source: { NAME: 'Ground water' } }]
      }])
      expect(result.licenceGaugingStations).to.equal([{
        id: 'ac075651-4781-4e24-a684-b943b98607ca',
        label: 'MEVAGISSEY FIRE STATION'
      }])
    })
  })
})
