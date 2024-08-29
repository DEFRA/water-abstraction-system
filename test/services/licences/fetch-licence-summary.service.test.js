'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const GaugingStationHelper = require('../../support/helpers/gauging-station.helper.js')
const LicenceDocumentHeaderHelper = require('../../support/helpers/licence-document-header.helper.js')
const LicenceEntityHelper = require('../../support/helpers/licence-entity.helper.js')
const LicenceEntityRoleHelper = require('../../support/helpers/licence-entity-role.helper.js')
const LicenceGaugingStationHelper = require('../../support/helpers/licence-gauging-station.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const LicenceHolderSeeder = require('../../support/seeders/licence-holder.seeder.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PermitLicenceHelper = require('../../support/helpers/permit-licence.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const RegionHelper = require('../../support/helpers/region.helper.js')

// Thing under test
const FetchLicenceSummaryService = require('../../../app/services/licences/fetch-licence-summary.service.js')

const REGION_SOUTHERN_INDEX = 5

describe('Fetch Licence Summary service', () => {
  let gaugingStation
  let licence
  let licenceDocumentHeader
  let licenceGaugingStation
  let licenceHolderSeed
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposeCondition
  let licenceVersionPurposeConditionType
  let permitLicence
  let purpose
  let region

  beforeEach(async () => {
    licenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.data.find((conditionType) => {
      return conditionType.displayTitle === 'Aggregate condition link between licences'
    })

    region = RegionHelper.select(REGION_SOUTHERN_INDEX)

    licence = await LicenceHelper.add({
      expiredDate: null,
      lapsedDate: null,
      regionId: region.id
    })

    // Create 2 licence versions so we can test the service only gets the 'current' version
    await LicenceVersionHelper.add({
      licenceId: licence.id, startDate: new Date('2021-10-11'), status: 'superseded'
    })
    licenceVersion = await LicenceVersionHelper.add({
      licenceId: licence.id, startDate: new Date('2022-05-01')
    })

    purpose = PurposeHelper.select()

    licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
      licenceVersionId: licenceVersion.id,
      purposeId: purpose.id
    })

    licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
    })

    licenceHolderSeed = await LicenceHolderSeeder.seed(licence.licenceRef)

    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      companyEntityId: licenceHolderSeed.companyId,
      licenceName: 'Licence Holder Ltd',
      licenceRef: licence.licenceRef
    })
    const { id: licenceEntityId } = await LicenceEntityHelper.add()

    await LicenceEntityRoleHelper.add({ companyEntityId: licenceHolderSeed.companyId, licenceEntityId })

    permitLicence = await PermitLicenceHelper.add({
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

    gaugingStation = await GaugingStationHelper.add()

    licenceGaugingStation = await LicenceGaugingStationHelper.add({
      gaugingStationId: gaugingStation.id,
      licenceId: licence.id
    })
  })

  describe('when called', () => {
    it('returns results', async () => {
      const result = await FetchLicenceSummaryService.go(licence.id)

      expect(result).to.equal({
        id: licence.id,
        expiredDate: null,
        startDate: new Date('2022-01-01'),
        region: {
          id: region.id,
          displayName: region.displayName
        },
        permitLicence: {
          id: permitLicence.id,
          purposes: [{
            purposePoints: [{
              point_source: { NAME: 'Ground water' }
            }]
          }]
        },
        licenceVersions: [
          {
            id: licenceVersion.id,
            startDate: new Date('2022-05-01'),
            status: 'current',
            licenceVersionPurposes: [{
              id: licenceVersionPurpose.id,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              annualQuantity: null,
              dailyQuantity: null,
              hourlyQuantity: null,
              instantQuantity: null,
              purpose: {
                id: purpose.id,
                description: purpose.description
              },
              licenceVersionPurposeConditions: [{
                id: licenceVersionPurposeCondition.id,
                licenceVersionPurposeConditionType: {
                  id: licenceVersionPurposeConditionType.id,
                  displayTitle: 'Aggregate condition link between licences'
                }
              }]
            }]
          }
        ],
        licenceGaugingStations: [{
          id: licenceGaugingStation.id,
          gaugingStation: {
            id: gaugingStation.id,
            label: 'MEVAGISSEY FIRE STATION'
          }
        }],
        licenceDocument: {
          id: licenceHolderSeed.licenceDocumentId,
          licenceDocumentRoles: [{
            id: licenceHolderSeed.licenceDocumentRoleId,
            contact: null,
            company: {
              id: licenceHolderSeed.companyId,
              name: 'Licence Holder Ltd',
              type: 'organisation'
            }
          }]
        },
        licenceDocumentHeader: {
          id: licenceDocumentHeader.id
        }
      })
    })
  })
})
