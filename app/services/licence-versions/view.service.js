'use strict'

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @module ViewService
 */

const FetchConditionsService = require('../licences/fetch-conditions.service.js')
const FetchLicenceVersionDal = require('../../dal/licence-versions/fetch-licence-version.dal.js')
const ViewPresenter = require('../../presenters/licence-versions/view.presenter.js')

/**
 * Orchestrates fetching and presenting the data for the `/licence-versions/{id}` page
 *
 * @param {string} licenceVersionId - The UUID of the licence version
 * @param {object} auth - The auth object taken from `request.auth` containing user details
 *
 * @returns {Promise<object>} The data formatted for the view template
 */
async function go(licenceVersionId, auth) {
  const licenceVersionData = await FetchLicenceVersionDal.go(licenceVersionId)
  const conditions = await FetchConditionsService.go(licenceVersionId)

  const pageData = ViewPresenter.go(licenceVersionData, auth, conditions)

  return {
    ...pageData
  }
}

module.exports = {
  go
}
