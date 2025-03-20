'use strict'

/**
 * @module TwoPartTariffSupplementarySeeder
 */

const BillRunHelper = require('../helpers/bill-run.helper.js')
const BillingAccountHelper = require('../helpers/billing-account.helper.js')
const ChangeReasonHelper = require('../helpers/change-reason.helper.js')
const ChargeCategoryHelper = require('../helpers/charge-category.helper.js')
const ChargeElementHelper = require('../helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../helpers/charge-version.helper.js')
const LicenceHelper = require('../helpers/licence.helper.js')
const LicenceSupplementaryYearHelper = require('../helpers/licence-supplementary-year.helper.js')
const RegionHelper = require('../helpers/region.helper.js')
const ReviewChargeElementHelper = require('../helpers/review-charge-element.helper.js')
const ReviewChargeReferenceHelper = require('../helpers/review-charge-reference.helper.js')
const ReviewChargeVersionHelper = require('../helpers/review-charge-version.helper.js')
const ReviewLicenceHelper = require('../helpers/review-licence.helper.js')

const ABATEMENT_S126 = 16
const MAJOR_CHANGE = 0

/**
 * Seeds two-part tariff supplementary data need to support testing of two-part tariff supplementary billing
 *
 * There are various scenarios the `FetchBillingAccountsService` needs to ensure it returns data for in order for the
 * generate supplementary billing engine to be able to raise bills correctly.
 *
 * We've moved the 'noise' of generating the test data into this seed, but unlike other seeders we don't need to
 * generate the all the data every time. The tests can specify the seed data to generate using 'scenarios'.
 *
 * ## simple
 *
 * The simplest of scenarios, for example, the licence was removed from the 2PT annual to be double checked. This would
 * have generated a licence supplementary year record (flagged it for 2PT supplementary).
 *
 * No changes are made, so it should be picked up and processed as is, which means it would go through the match &
 * allocate stage and so have some linked review records.
 *
 * ## duplicate
 *
 * The licence and billing account setup is just like [simple](#simple), only there are multiple licence supplementary
 * year records for the licence.
 *
 * This can happen if a change is made to the licence (first record created), then a two-part tariff supplementary bill
 * run is started (first record gets assigned to the bill run). Then, a user makes another change to the licence (second
 * record created).
 *
 * Meantime, the two-part tariff supplementary bill run is cancelled, which means the first record gets unassigned. The
 * result? Two licence supplementary year records for the same licence and financial year end.
 *
 * When the next two-part tariff supplementary bill run is created both will get assigned to it, but we only want
 * `FetchBillingAccountsService` to return a single set of results for the licence.
 *
 * ## change-billing-account
 *
 * In this scenario, the licence was first assigned to billing account A, then this was changed to billing account B
 * from 2023-04-01.
 *
 * If the two-part tariff annual was created before the change, then we need to fetch billing account A and the first
 * charge version (A) as well as billing account B and its charge version (B), so the generate engine can find the
 * previous transaction against billing account A and raise a credit.
 *
 * ## non-chargeable
 *
 * The licence was previously billed in a two-part tariff annual, but then has been made non-chargeable. This is done by
 * adding a new non-chargeable charge version to the licence.
 *
 * In this scenario, when the 2PT supplementary is run for 2023/24, the billing account and first charge version (A)
 * will still be picked up which allows the generate stage to check for previous transactions, but because nothing is
 * now 'current' it won't be picked up by the match & allocate stage (so no review records).
 *
 * ## non-two-part-tariff
 *
 * The licence was previously billed in a two-part tariff annual, but then has been made non-two-part-tariff. This is
 * done by adding a new charge version with two-part tariff unticked to the licence.
 *
 * In this scenario, when the 2PT supplementary is run for 2023/24, the billing account and first charge version (A)
 * will still be picked up which allows the generate stage to check for previous transactions, but because nothing is
 * now 'two-part-tariff' it won't be picked up by the match & allocate stage (so no review records).
 *
 * @param {string} scenario - the scenario that determines what seed data to generate: duplicate, simple,
 * change-billing-account, non-chargeable, and non-two-part-tariff
 *
 * @returns {Promise<object>} An object containing references to all the seeded data
 */
async function seed(scenario) {
  const billingPeriod = {
    startDate: new Date('2023-04-01'),
    endDate: new Date('2024-03-31')
  }

  const financialYear = billingPeriod.endDate.getFullYear()
  const region = RegionHelper.select()

  const billRun = await BillRunHelper.add({
    batchType: 'two_part_supplementary',
    fromFinancialYearEnding: financialYear,
    regionId: region.id,
    toFinancialYearEnding: financialYear
  })

  const chargeCategory = ChargeCategoryHelper.select()

  let data

  switch (scenario) {
    case 'change-billing-account':
      data = await _changeBillingAccount(billRun, chargeCategory)
      break
    case 'duplicate':
      data = await _duplicate(billRun, chargeCategory)
      break
    case 'non-chargeable':
      data = await _nonChargeable(billRun, chargeCategory)
      break
    case 'non-two-part-tariff':
      data = await _nonTwoPartTariff(billRun, chargeCategory)
      break
    case 'simple':
      data = await _simple(billRun, chargeCategory)
      break
  }

  return {
    billingPeriod,
    billRun,
    chargeCategory,
    data,
    region,
    scenario,
    ...data
  }
}

/**
 * Deletes all the seeded two-part tariff supplementary data
 *
 * @param {object} seedData - The object containing seed data generated by `seed()`
 */
async function zap(seedData) {
  const { billRun, scenario } = seedData

  await billRun.$query().delete()

  switch (scenario) {
    case 'change-billing-account':
      await _zapChangeBillingAccount(seedData)
      break
    case 'duplicate':
      await _zapDuplicate(seedData)
      break
    case 'non-chargeable':
      await _zapNonChargeable(seedData)
      break
    case 'non-two-part-tariff':
      await _zapNonTwoPartTariff(seedData)
      break
    case 'simple':
      await _zapSimple(seedData)
      break
  }
}

async function _changeBillingAccount(billRun, chargeCategory) {
  const licence = await LicenceHelper.add({ regionId: billRun.regionId })

  const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })

  // NOTE: We control the account numbers so we can both test the ordering FetchBillingAccountsService applies and
  // predict the result to more easily assert against
  let billingAccountNumber = BillingAccountHelper.generateAccountNumber()
  billingAccountNumber = billingAccountNumber.replace('T', 'W')
  const billingAccountA = await BillingAccountHelper.add({ accountNumber: billingAccountNumber })

  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)

  const chargeVersionA = await ChargeVersionHelper.add({
    billingAccountId: billingAccountA.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: new Date('2023-03-31'),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2022-04-01')
  })
  const chargeReferenceA = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersionA.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElementA = await ChargeElementHelper.add({ chargeReferenceId: chargeReferenceA.id })

  const billingAccountB = await BillingAccountHelper.add()

  const chargeVersionB = await ChargeVersionHelper.add({
    billingAccountId: billingAccountB.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2023-04-01')
  })
  const chargeReferenceB = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersionB.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElementB = await ChargeElementHelper.add({ chargeReferenceId: chargeReferenceB.id })

  const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })
  const reviewChargeVersion = await ReviewChargeVersionHelper.add({
    chargeVersionId: chargeVersionB.id,
    reviewLicenceId: reviewLicence.id
  })
  const reviewChargeReference = await ReviewChargeReferenceHelper.add({
    chargeReferenceId: chargeReferenceB.id,
    reviewChargeVersionId: reviewChargeVersion.id
  })
  const reviewChargeElement = await ReviewChargeElementHelper.add({
    chargeElementId: chargeElementB.id,
    reviewChargeReferenceId: reviewChargeReference.id
  })

  return {
    billingAccountA,
    billingAccountB,
    chargeElementA,
    chargeElementB,
    chargeReferenceA,
    chargeReferenceB,
    chargeVersionA,
    chargeVersionB,
    licence,
    licenceSupplementaryYear,
    reviewChargeElement,
    reviewChargeReference,
    reviewLicence
  }
}

async function _duplicate(billRun, chargeCategory) {
  const licence = await LicenceHelper.add({ regionId: billRun.regionId })

  const licenceSupplementaryYear1 = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })
  const licenceSupplementaryYear2 = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })

  const billingAccount = await BillingAccountHelper.add()

  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)

  const chargeVersion = await ChargeVersionHelper.add({
    billingAccountId: billingAccount.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2022-04-01')
  })
  const chargeReference = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersion.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })

  const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })
  const reviewChargeVersion = await ReviewChargeVersionHelper.add({
    chargeVersionId: chargeVersion.id,
    reviewLicenceId: reviewLicence.id
  })
  const reviewChargeReference = await ReviewChargeReferenceHelper.add({
    chargeReferenceId: chargeReference.id,
    reviewChargeVersionId: reviewChargeVersion.id
  })
  const reviewChargeElement = await ReviewChargeElementHelper.add({
    chargeElementId: chargeElement.id,
    reviewChargeReferenceId: reviewChargeReference.id
  })

  return {
    billingAccount,
    chargeElement,
    chargeReference,
    chargeVersion,
    licence,
    licenceSupplementaryYear1,
    licenceSupplementaryYear2,
    reviewChargeElement,
    reviewChargeReference,
    reviewLicence
  }
}

async function _nonChargeable(billRun, chargeCategory) {
  const licence = await LicenceHelper.add({ regionId: billRun.regionId })

  const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })

  const billingAccount = await BillingAccountHelper.add()

  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)

  const chargeVersionA = await ChargeVersionHelper.add({
    billingAccountId: billingAccount.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: new Date('2023-03-31'),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2022-04-01')
  })
  const chargeReferenceA = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersionA.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElementA = await ChargeElementHelper.add({ chargeReferenceId: chargeReferenceA.id })

  const nonChargeableChangeReason = ChangeReasonHelper.select(ABATEMENT_S126)

  const chargeVersionB = await ChargeVersionHelper.add({
    billingAccountId: null,
    changeReasonId: nonChargeableChangeReason.id,
    endDate: null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2023-04-01')
  })

  return {
    billingAccount,
    chargeElementA,
    chargeReferenceA,
    chargeVersionA,
    chargeVersionB,
    licence,
    licenceSupplementaryYear
  }
}

async function _nonTwoPartTariff(billRun, chargeCategory) {
  const licence = await LicenceHelper.add({ regionId: billRun.regionId })

  const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })

  const billingAccount = await BillingAccountHelper.add()

  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)

  const chargeVersionA = await ChargeVersionHelper.add({
    billingAccountId: billingAccount.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: new Date('2023-03-31'),
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2022-04-01')
  })
  const chargeReferenceA = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersionA.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElementA = await ChargeElementHelper.add({ chargeReferenceId: chargeReferenceA.id })

  const chargeVersionB = await ChargeVersionHelper.add({
    billingAccountId: billingAccount.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2023-04-01')
  })
  const chargeReferenceB = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: false, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersionB.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElementB = await ChargeElementHelper.add({ chargeReferenceId: chargeReferenceB.id })

  return {
    billingAccount,
    chargeElementA,
    chargeElementB,
    chargeReferenceA,
    chargeReferenceB,
    chargeVersionA,
    chargeVersionB,
    licence,
    licenceSupplementaryYear
  }
}

async function _simple(billRun, chargeCategory) {
  const licence = await LicenceHelper.add({ regionId: billRun.regionId })

  const licenceSupplementaryYear = await LicenceSupplementaryYearHelper.add({
    billRunId: billRun.id,
    financialYearEnd: billRun.toFinancialYearEnding,
    licenceId: licence.id
  })

  const billingAccount = await BillingAccountHelper.add()

  const chargeableChangeReason = ChangeReasonHelper.select(MAJOR_CHANGE)

  const chargeVersion = await ChargeVersionHelper.add({
    billingAccountId: billingAccount.id,
    changeReasonId: chargeableChangeReason.id,
    endDate: null,
    licenceId: licence.id,
    licenceRef: licence.licenceRef,
    startDate: new Date('2022-04-01')
  })
  const chargeReference = await ChargeReferenceHelper.add({
    adjustments: { s126: null, s127: true, s130: false, charge: null, winter: false, aggregate: 0.562114443 },
    chargeVersionId: chargeVersion.id,
    chargeCategoryId: chargeCategory.id
  })
  const chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })

  const reviewLicence = await ReviewLicenceHelper.add({ billRunId: billRun.id, licenceId: licence.id })
  const reviewChargeVersion = await ReviewChargeVersionHelper.add({
    chargeVersionId: chargeVersion.id,
    reviewLicenceId: reviewLicence.id
  })
  const reviewChargeReference = await ReviewChargeReferenceHelper.add({
    chargeReferenceId: chargeReference.id,
    reviewChargeVersionId: reviewChargeVersion.id
  })
  const reviewChargeElement = await ReviewChargeElementHelper.add({
    chargeElementId: chargeElement.id,
    reviewChargeReferenceId: reviewChargeReference.id
  })

  return {
    billingAccount,
    chargeElement,
    chargeReference,
    chargeVersion,
    licence,
    licenceSupplementaryYear,
    reviewChargeElement,
    reviewChargeReference,
    reviewLicence
  }
}

async function _zapChangeBillingAccount(seedData) {
  await seedData.billingAccountA.$query().delete()
  await seedData.billingAccountB.$query().delete()
  await seedData.chargeElementA.$query().delete()
  await seedData.chargeElementB.$query().delete()
  await seedData.chargeReferenceA.$query().delete()
  await seedData.chargeReferenceB.$query().delete()
  await seedData.chargeVersionA.$query().delete()
  await seedData.chargeVersionB.$query().delete()
  await seedData.licence.$query().delete()
  await seedData.licenceSupplementaryYear.$query().delete()
  await seedData.reviewChargeElement.$query().delete()
  await seedData.reviewChargeReference.$query().delete()
  await seedData.reviewLicence.$query().delete()
}

async function _zapDuplicate(seedData) {
  await seedData.billingAccount.$query().delete()
  await seedData.chargeElement.$query().delete()
  await seedData.chargeReference.$query().delete()
  await seedData.chargeVersion.$query().delete()
  await seedData.licence.$query().delete()
  await seedData.licenceSupplementaryYear1.$query().delete()
  await seedData.licenceSupplementaryYear2.$query().delete()
  await seedData.reviewChargeElement.$query().delete()
  await seedData.reviewChargeReference.$query().delete()
  await seedData.reviewLicence.$query().delete()
}

async function _zapNonChargeable(seedData) {
  await seedData.billingAccount.$query().delete()
  await seedData.chargeElementA.$query().delete()
  await seedData.chargeReferenceA.$query().delete()
  await seedData.chargeVersionA.$query().delete()
  await seedData.chargeVersionB.$query().delete()
  await seedData.licence.$query().delete()
  await seedData.licenceSupplementaryYear.$query().delete()
}

async function _zapNonTwoPartTariff(seedData) {
  await seedData.billingAccount.$query().delete()
  await seedData.chargeElementA.$query().delete()
  await seedData.chargeElementB.$query().delete()
  await seedData.chargeReferenceA.$query().delete()
  await seedData.chargeReferenceB.$query().delete()
  await seedData.chargeVersionA.$query().delete()
  await seedData.chargeVersionB.$query().delete()
  await seedData.licence.$query().delete()
  await seedData.licenceSupplementaryYear.$query().delete()
}

async function _zapSimple(seedData) {
  await seedData.billingAccount.$query().delete()
  await seedData.chargeElement.$query().delete()
  await seedData.chargeReference.$query().delete()
  await seedData.chargeVersion.$query().delete()
  await seedData.licence.$query().delete()
  await seedData.licenceSupplementaryYear.$query().delete()
  await seedData.reviewChargeElement.$query().delete()
  await seedData.reviewChargeReference.$query().delete()
  await seedData.reviewLicence.$query().delete()
}

module.exports = {
  seed,
  zap
}
