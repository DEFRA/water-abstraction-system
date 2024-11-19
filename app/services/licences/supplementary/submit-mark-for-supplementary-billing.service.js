'use strict'

/**
 * Orchestrates flagging a licence for pre sroc and sroc supplementary billing
 * @module SubmitMarkForSupplementaryBillingService
 */

const CreateLicenceSupplementaryYearService = require('./create-licence-supplementary-year.service.js')
const DetermineExistingBillRunYearsService = require('./determine-existing-bill-run-years.service.js')
const LegacyRequest = require('../../../requests/legacy.request.js')
const LicenceModel = require('../../../models/licence.model.js')
const MarkForSupplementaryBillingPresenter = require('../../../presenters/licences/supplementary/mark-for-supplementary-billing.presenter.js')
const SupplementaryYearValidator = require('../../../validators/licences/supplementary/supplementary-year.validator.js')

/**
 * Handles the submission to mark a licence for supplementary billing.
 * Validates the submitted form data and flags the licence for supplementary billing based on the provided years.
 *
 * If "preSroc" is part of the selected years, it will call the legacy system to mark those years.
 * After marking for legacy years, it processes the remaining years for supplementary billing.
 *
 * @param {string} licenceId - The UUID of the licence to flag
 * @param {object} payload - The submitted form data
 * @param {object} user - Instance of `UserModel` that represents the user making the request
 *
 * @returns {Promise<object>} The licence marked for supplementary billing
 */
async function go (licenceId, payload, user) {
  const validationResult = _validate(payload)

  if (!validationResult) {
    let { supplementaryYears } = payload

    // If the user picked multiple years this comes through as an array. If they only picked one year it comes through
    // as a string.
    supplementaryYears = Array.isArray(supplementaryYears) ? supplementaryYears : [supplementaryYears]

    await _flagLicenceYears(supplementaryYears, licenceId, user)

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

async function _fetchLicenceData (licenceId) {
  return LicenceModel.query()
    .findById(licenceId)
    .select([
      'id',
      'licenceRef',
      'regionId'
    ])
}

async function _flagLicenceYears (supplementaryYears, licenceId, user) {
  if (supplementaryYears.includes('preSroc')) {
    await LegacyRequest.post('water', `licences/${licenceId}/mark-for-supplementary-billing`, user.id)

    // Remove the 'preSroc' property to allow the supplementary years to be passed to our sroc supplementary flagging
    // service
    supplementaryYears = supplementaryYears.filter((year) => {
      return year !== 'preSroc'
    })
  }

  if (supplementaryYears.length === 0) {
    return
  }

  const { regionId } = await _fetchLicenceData(licenceId)
  const twoPartTariff = true

  const financialYearEnds = await DetermineExistingBillRunYearsService.go(regionId, supplementaryYears, twoPartTariff)

  if (financialYearEnds.length === 0) {
    return
  }

  await CreateLicenceSupplementaryYearService.go(licenceId, financialYearEnds, twoPartTariff)
}

async function _getPageData (licenceId) {
  const licenceData = await _fetchLicenceData(licenceId)

  const pageData = MarkForSupplementaryBillingPresenter.go(licenceData)

  return pageData
}

function _validate (payload) {
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
