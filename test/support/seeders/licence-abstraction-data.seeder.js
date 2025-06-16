'use strict'

/**
 * @module LicenceAbstractionDataSeeder
 */

const FinancialAgreementHelper = require('../helpers/financial-agreement.helper.js')
const LicenceFinancialAgreement = require('../helpers/licence-agreement.helper.js')
const LicenceHelper = require('../helpers/licence.helper.js')
const LicenceVersionHelper = require('../helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposePointHelper = require('../helpers/licence-version-purpose-point.helper.js')
const PointHelper = require('../helpers/point.helper.js')
const PrimaryPurposeHelper = require('../helpers/primary-purpose.helper.js')
const PurposeHelper = require('../helpers/purpose.helper.js')
const RegionHelper = require('../helpers/region.helper.js')
const SecondaryPurposeHelper = require('../helpers/secondary-purpose.helper.js')
const { generateLicenceRef } = require('../helpers/licence.helper.js')
const { generateLicenceVersionExternalId } = require('../helpers/licence-version.helper.js')
const { generateLicenceVersionPurposeExternalId } = require('../helpers/licence-version-purpose.helper.js')

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
 * points and the rest 1
 *
 * @param {string | undefined} optionalLicenceRef - The licence reference to use for the seeded licence
 *
 * @returns {Promise<object>} all the named IDs for then seeded records in an object
 */
async function seed(optionalLicenceRef = undefined) {
  const records = {}

  let licenceRef = generateLicenceRef()

  if (optionalLicenceRef) {
    licenceRef = optionalLicenceRef
  }

  const { id: regionId } = RegionHelper.select()
  const { id: licenceId } = await LicenceHelper.add({ licenceRef, regionId })

  records.regionId = regionId
  records.licenceId = licenceId
  records.licenceRef = licenceRef

  records.financialAgreements = await _financialAgreements()
  records.allPurposes = await _purposes()

  records.licenceFinancialAgreements = await _licenceFinancialAgreement(licenceRef, records.financialAgreements)
  records.licenceVersions = await _licenceVersions(licenceId)
  records.licenceVersionPurposes = await _licenceVersionPurposes(records.licenceVersions.currentId, records.allPurposes)
  records.points = await _points(records.licenceVersionPurposes)

  return records
}

async function _financialAgreements() {
  const section126 = FinancialAgreementHelper.select(2)
  const twoPartTariff = FinancialAgreementHelper.select(3)

  return { section126Id: section126.id, twoPartTariffId: twoPartTariff.id }
}

async function _licenceFinancialAgreement(licenceRef, financialAgreements) {
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

async function _licenceVersions(licenceId) {
  const { id: supersededId } = await LicenceVersionHelper.add({
    endDate: new Date('2022-04-31'),
    externalId: generateLicenceVersionExternalId(),
    issue: 100,
    licenceId,
    startDate: new Date('2021-10-11'),
    status: 'superseded'
  })

  const { id: currentId } = await LicenceVersionHelper.add({
    externalId: generateLicenceVersionExternalId(),
    issue: 101,
    licenceId,
    startDate: new Date('2022-05-01'),
    status: 'current'
  })

  return { currentId, supersededId }
}

async function _licenceVersionPurposes(licenceVersionId, allPurposes) {
  const electricity = await LicenceVersionPurposeHelper.add({
    dailyQuantity: 455,
    externalId: generateLicenceVersionPurposeExternalId(),
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryElectricityId,
    purposeId: allPurposes.purposes.heatPumpId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryElectricityId
  })

  const standard = await LicenceVersionPurposeHelper.add({
    dailyQuantity: 2675,
    externalId: generateLicenceVersionPurposeExternalId(),
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryAgricultureId,
    purposeId: allPurposes.purposes.vegetableWashingId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryAgricultureId
  })

  const twoPartTariff = await LicenceVersionPurposeHelper.add({
    dailyQuantity: 300,
    externalId: generateLicenceVersionPurposeExternalId(),
    licenceVersionId,
    primaryPurposeId: allPurposes.primaryPurposes.primaryAgricultureId,
    purposeId: allPurposes.purposes.sprayIrrigationDirectId,
    secondaryPurposeId: allPurposes.secondaryPurposes.secondaryAgricultureId
  })

  return { electricity, standard, twoPartTariff }
}

async function _points(licenceVersionPurposes) {
  const {
    electricity: electricityPurpose,
    standard: standardPurpose,
    twoPartTariff: twoPartTariffPurpose
  } = licenceVersionPurposes

  const electricity1 = await PointHelper.add({ description: 'INTAKE POINT' })
  const electricity2 = await PointHelper.add({ description: 'OUT TAKE POINT' })
  const standard = await PointHelper.add({ description: 'SOUTH BOREHOLE' })
  const twoPartTariff = await PointHelper.add({ description: 'MAIN INTAKE' })

  await LicenceVersionPurposePointHelper.add({
    licenceVersionPurposeId: electricityPurpose.id,
    pointId: electricity1.id
  })
  await LicenceVersionPurposePointHelper.add({
    licenceVersionPurposeId: electricityPurpose.id,
    pointId: electricity2.id
  })
  await LicenceVersionPurposePointHelper.add({
    licenceVersionPurposeId: standardPurpose.id,
    pointId: standard.id
  })
  await LicenceVersionPurposePointHelper.add({
    licenceVersionPurposeId: twoPartTariffPurpose.id,
    pointId: twoPartTariff.id
  })

  return { electricity1, electricity2, standard, twoPartTariff }
}

async function _purposes() {
  const { id: heatPumpId } = PurposeHelper.data.find((purpose) => {
    return purpose.legacyId === '200'
  })

  const { id: sprayIrrigationDirectId } = PurposeHelper.data.find((purpose) => {
    return purpose.legacyId === '400'
  })

  const { id: vegetableWashingId } = PurposeHelper.data.find((purpose) => {
    return purpose.legacyId === '460'
  })

  const { id: primaryAgricultureId } = PrimaryPurposeHelper.data.find((purpose) => {
    return purpose.legacyId === 'A'
  })

  const { id: primaryElectricityId } = PrimaryPurposeHelper.data.find((purpose) => {
    return purpose.legacyId === 'P'
  })

  const { id: secondaryAgricultureId } = SecondaryPurposeHelper.data.find((purpose) => {
    return purpose.legacyId === 'AGR'
  })

  const { id: secondaryElectricityId } = SecondaryPurposeHelper.data.find((purpose) => {
    return purpose.legacyId === 'ELC'
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
