'use strict'

/**
 * Orchestrates flagging a licence for pre sroc and sroc supplementary billing
 * @module SubmitMarkForSupplementaryBillingService
 */

const DetermineExistingBillRunYearsService = require('./determine-existing-bill-run-years.service.js')
const LicenceModel = require('../../../models/licence.model.js')
const MarkForSupplementaryBillingPresenter = require('../../../presenters/licences/supplementary/mark-for-supplementary-billing.presenter.js')
const PersistSupplementaryBillingFlagsService = require('./persist-supplementary-billing-flags.service.js')
const SupplementaryYearValidator = require('../../../validators/licences/supplementary/supplementary-year.validator.js')

/**
 * Handles the submission to mark a licence for supplementary billing.
 * Validates the submitted form data and flags the licence for supplementary billing based on the provided years.
 *
 * If "preSroc" is part of the selected years, it will flag this as true and update all the licence flags by calling
 * `PersistSupplementaryBillingFlagsService`.
 *
 * @param {string} licenceId - The UUID of the licence to flag
 * @param {object} payload - The submitted form data
 *
 * @returns {Promise<object>} The licence marked for supplementary billing
 */
async function go(licenceId, payload) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    let { supplementaryYears } = payload

    // If the user picked multiple years this comes through as an array. If they only picked one year it comes through
    // as a string.
    supplementaryYears = Array.isArray(supplementaryYears) ? supplementaryYears : [supplementaryYears]

    await _flagForBilling(supplementaryYears, licenceId)

    return { error: null }
  }

  const pageData = await _getPageData(licenceId)

  return {
    activeNavBar: 'search',
    pageTitle: 'Mark for the supplementary bill run',
    error: validationResult,
    ...pageData
  }
}

/**
 * The page only flags a licence for two-part tariff billing. Pre-sroc billing included two-part tariff bills (as
 * two-part tariff had not been separated out into its own annual bill run like it is with sroc). This means we need
 * to determine the pre-sroc flag and the two-part tariff billing years.
 *
 * Since we persist all 3 types of flags, we need to also carry over the existing sroc supplementary flag value.
 *
 * @private
 */
async function _determineLicenceFlags(licence, supplementaryYears) {
  // Set the existing sroc supplementary flag, this flag does not get changed
  const flagForSrocSupplementary = licence.includeInPresrocBilling
  // Set the existing pre-sroc supplementary flag
  let flagForPreSrocSupplementary = licence.includeInPresrocBilling === 'yes'

  // Update the pre-sroc supplementary flag if the user selected a pre-sroc year
  if (supplementaryYears.includes('preSroc')) {
    flagForPreSrocSupplementary = true

    // Remove the 'preSroc' property to allow the supplementary years to be passed to our sroc supplementary flagging
    // service
    supplementaryYears = supplementaryYears.filter((year) => {
      return year !== 'preSroc'
    })
  }

  let twoPartTariffBillingYears = []

  if (supplementaryYears.length > 0) {
    const twoPartTariff = true

    twoPartTariffBillingYears = await DetermineExistingBillRunYearsService.go(
      licence.regionId,
      supplementaryYears,
      twoPartTariff
    )
  }

  return { twoPartTariffBillingYears, flagForPreSrocSupplementary, flagForSrocSupplementary }
}

async function _fetchLicenceData(licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select(['id', 'licenceRef', 'regionId', 'includeInSrocBilling', 'includeInPresrocBilling'])
}

async function _flagForBilling(supplementaryYears, licenceId) {
  const licence = await _fetchLicenceData(licenceId)

  const { twoPartTariffBillingYears, flagForPreSrocSupplementary, flagForSrocSupplementary } =
    await _determineLicenceFlags(licence, supplementaryYears)

  await PersistSupplementaryBillingFlagsService.go(
    twoPartTariffBillingYears,
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    licenceId
  )
}

async function _getPageData(licenceId) {
  const licenceData = await _fetchLicenceData(licenceId)

  const pageData = MarkForSupplementaryBillingPresenter.go(licenceData)

  return pageData
}

function _validate(payload) {
  const validation = SupplementaryYearValidator.go(payload)

  if (!validation.error) {
    return null
  }

  const { message } = validation.error.details[0]

  return {
    text: message
  }
}

module.exports = {
  go
}
