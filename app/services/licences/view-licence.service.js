'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 * @module ViewLicenceService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const ViewLicenceActiveTabDataService = require('./active-tab-license.service')
const ViewLicencePresenter = require('../../presenters/licences/view-licence.presenter')
const ViewLicenceTabNavBarPresenter = require('../../presenters/licences/tab-nav-bar.presenter')
/**
 * Orchestrates fetching and presenting the data needed for the licence summary page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence summary template.
 */
async function go (licenceId, tab) {
  const licenceData = await FetchLicenceService.go(licenceId)

  const commonData = ViewLicencePresenter.go(licenceData)
  const pageData = await ViewLicenceActiveTabDataService.go(tab, licenceData)

  return {
    ...commonData,
    ...pageData,
    tabs: ViewLicenceTabNavBarPresenter.go(tab),
    activeTab: tab
  }
}

module.exports = {
  go
}
