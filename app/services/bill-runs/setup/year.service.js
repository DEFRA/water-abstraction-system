'use strict'

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/year` page
 * @module YearService
 */

const FetchLicenceSupplementaryYearsService = require('./fetch-licence-supplementary-years.service.js')
const SessionModel = require('../../../models/session.model.js')
const YearPresenter = require('../../../presenters/bill-runs/setup/year.presenter.js')

/**
 * Orchestrates fetching and presenting the data for `/bill-runs/setup/{sessionId}/year` page
 *
 * Supports generating the data needed for the year page in the setup bill run journey. It fetches the current
 * session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup bill run session record
 *
 * @returns {Promise<object>} The view data for the year page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)

  const regionId = session.region
  const twoPartTariffSupplementary = session.type === 'two_part_supplementary'
  const licenceSupplementaryYears = await FetchLicenceSupplementaryYearsService.go(regionId, twoPartTariffSupplementary)

  const formattedData = YearPresenter.go(licenceSupplementaryYears, session)

  return {
    ...formattedData
  }
}

module.exports = {
  go
}
