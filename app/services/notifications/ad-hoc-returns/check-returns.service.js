'use strict'

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 * @module CheckReturnsService
 */

const CheckReturnsPresenter = require('../../../presenters/notifications/ad-hoc-returns/check-returns.presenter.js')
const SessionModel = require('../../../models/session.model.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Orchestrates fetching and presenting the data for `/notifications/ad-hoc-returns/{sessionId}/check-returns` page
 *
 * Supports generating the data needed for the check returns page in the ad-hoc returns notification journey. It fetches
 * the current session record and formats the data needed for the form.
 *
 * @param {string} sessionId - The UUID for setup ad-hoc returns notification session record
 *
 * @returns {Promise<object>} The view data for the check returns page
 */
async function go(sessionId) {
  const session = await SessionModel.query().findById(sessionId)
  const pageData = await _fetchPageData(session.licenceRef)
  console.log('🚀  pageData:', pageData)
  const formattedData = CheckReturnsPresenter.go(pageData, session)

  return {
    ...formattedData
  }
}

async function _fetchPageData(licenceRef) {
  return await LicenceModel.query()
    .where('licenceRef', licenceRef)
    .withGraphFetched('returns')
    .modifyGraph('returns', (builder) => {
      builder.select(['id', 'returnReference', 'dueDate']).where('status', 'due')
    })
}

module.exports = {
  go
}
