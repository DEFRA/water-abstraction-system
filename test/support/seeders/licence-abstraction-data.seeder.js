'use strict'

/**
 * @module LicenceAbstractionDataSeeder
 */

const FinancialAgreementHelper = require('../helpers/financial-agreement.helper.js')
const LicenceFinancialAgreement = require('../helpers/licence-agreement.helper.js')
const LicenceHelper = require('../helpers/licence.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../helpers/licence-version-purpose.helper.js')
const PermitLicenceHelper = require('../helpers/permit-licence.helper.js')
const PrimaryPurposeHelper = require('../helpers/primary-purpose.helper.js')
const PurposeHelper = require('../helpers/purpose.helper.js')
const RegionHelper = require('../helpers/region.helper.js')
const SecondaryPurposeHelper = require('../helpers/secondary-purpose.helper.js')

/**
 * Seeds a licence with all the related records to get a 'real' set of abstraction data
 *
 * Was built to support the testing of `FetchAbstractionDataService` but can be used in any scenario where a complete
 * 'abstraction data' record is needed.
 *
 * It creates a licence with
 *
 * - 2 licence versions; one current and one superseded
 * - 3 licence version purposes; one for an electricity purpose, one for a two-part purpose, one standard
 * - 2 licence financial agreements: one that is current but not 2PT, the other is 2PT but has ended
 * - 1 permit licence containing 3 legacy purposes which match to the 3 licence version purposes, the first containing 2
 *   points and the rest 1
 *
 * @param {String} licenceRef - The licence reference to use for the seeded licence
 *
 * @returns {Promise<Object>} all the named IDs for then seeded records in an object
 */
async function seed (licenceRef) {
  const records = {}

  const { id: regionId } = await RegionHelper.add({ naldRegionId: 1 })
  const { id: licenceId } = await LicenceHelper.add({ licenceRef, regionId })

  records.regionId = regionId
  records.licenceId = licenceId

  records.financialAgreements = await _financialAgreements()
  records.allPurposes = await _purposes()

  records.licenceFinancialAgreements = await _licenceFinancialAgreement(licenceRef, records.financialAgreements)
  records.licenceVersions = await _licenceVersions(licenceId)
  records.licenceVersionPurposes = await _licenceVersionPurposes(records.licenceVersions.currentId, records.allPurposes)
  records.permitLicence = await _permitLicence(licenceRef)

  return records
}

async function _financialAgreements () {
  const { id: section126Id } = await FinancialAgreementHelper.add({
    code: 'S126',
    description: 'Section 126'
  })

  const { id: twoPartTariffId } = await FinancialAgreementHelper.add({
    code: 'S127',
    description: 'Section 127 (Two Part Tariff)'
  })

  return { section126Id, twoPartTariffId }
}

async function _licenceFinancialAgreement (licenceRef, financialAgreements) {
  const { id: currentNonTwoPartId } = await LicenceFinancialAgreement.add({
    financialAgreementId: financialAgreements.section126Id,
    licenceRef
  })

  const { id: endedTwoPartId } = await LicenceFinancialAgreement.add({
    endDate: new Date('2024-03-01'),
    financialAgreementId: financialAgreements.twoPartTariffId,
    licenceRef
  })

  return { currentNonTwoPartId, endedTwoPartId }
}

async function _licenceVersions (licenceId) {
  const { id: supersededId } = await LicenceVersionHelper.add({
    endDate: new Date('2022-04-31'),
    externalId: '1:100234:100:0',
    issue: 100,
    licenceId,
    startDate: new Date('2021-10-11'),
    status: 'superseded'
  })

  const { id: currentId } = await LicenceVersionHelper.add({
    externalId: '1:100234:101:0',
    issue: 101,
    licenceId,
    startDate: new Date('2022-05-01'),
    status: 'current'
  })

  return { currentId, supersededId }
}

async function _licenceVersionPurposes (licenceVersionId, allPurposes) {
  const { id: electricityId } = await LicenceVersionPurposeHelper.add({
    externalId: '1:10065380',
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryElectricityId,
    purposeId: allPurposes.purposes.heatPumpId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryElectricityId
  })

  const { id: standardId } = await LicenceVersionPurposeHelper.add({
    externalId: '1:10065381',
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryAgricultureId,
    purposeId: allPurposes.purposes.vegetableWashingId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryAgricultureId
  })

  const { id: twoPartTariffId } = await LicenceVersionPurposeHelper.add({
    externalId: '1:10065382',
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryAgricultureId,
    purposeId: allPurposes.purposes.sprayIrrigationDirectId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryAgricultureId
  })

  return { electricityId, standardId, twoPartTariffId }
}

async function _permitLicence (licenceRef) {
  const licenceDataValue = {
    ID: '10021954',
    data: {
      current_version: {
        purposes: [
          {
            ID: '10065380',
            purposePoints: [
              {
                point_detail: {
                  ID: '10030400',
                  LOCAL_NAME: 'INTAKE POINT'
                }
              },
              {
                point_detail: {
                  ID: '10030401',
                  LOCAL_NAME: 'OUT TAKE POINT'
                }
              }
            ]
          },
          {
            ID: '10065381',
            purposePoints: [
              {
                point_detail: {
                  ID: '10030500',
                  LOCAL_NAME: 'SOUTH BOREHOLE'
                }
              }
            ]
          },
          {
            ID: '10065382',
            purposePoints: [
              {
                point_detail: {
                  ID: '10030600',
                  LOCAL_NAME: 'MAIN INTAKE'
                }
              }
            ]
          }
        ]
      }
    }
  }

  const { id: permitLicenceId } = await PermitLicenceHelper.add({ licenceRef, licenceDataValue })

  return permitLicenceId
}

async function _purposes () {
  const { id: heatPumpId } = await PurposeHelper.add({
    legacyId: '200',
    description: 'Heat Pump',
    twoPartTariff: false
  })

  const { id: sprayIrrigationDirectId } = await PurposeHelper.add({
    legacyId: '400',
    description: 'Spray Irrigation - Direct',
    twoPartTariff: true
  })

  const { id: vegetableWashingId } = await PurposeHelper.add({
    legacyId: '460',
    description: 'Vegetable washing',
    twoPartTariff: false
  })

  const { id: primaryAgricultureId } = await PrimaryPurposeHelper.add({
    legacyId: 'A',
    description: 'Agriculture'
  })

  const { id: primaryElectricityId } = await PrimaryPurposeHelper.add({
    legacyId: 'P',
    description: 'Production Of Energy'
  })

  const { id: secondaryAgricultureId } = await SecondaryPurposeHelper.add({
    legacyId: 'AGR',
    description: 'General Agriculture'
  })

  const { id: secondaryElectricityId } = await SecondaryPurposeHelper.add({
    legacyId: 'ELC',
    description: 'Electricity'
  })

  return {
    purposes: { heatPumpId, sprayIrrigationDirectId, vegetableWashingId },
    primaryPurposes: { primaryAgricultureId, primaryElectricityId },
    secondaryPurposes: { secondaryAgricultureId, secondaryElectricityId }
  }
}

module.exports = {
  seed
}
