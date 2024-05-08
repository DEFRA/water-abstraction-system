'use strict'

/**
 * Orchestrates fetching and presenting the data needed for the licence contact page
 * @module ViewLicenceContactDetailsService
 */

const ViewLicenceContactDetailsPresenter = require('../../presenters/licences/view-licence-contact-details.presenter')
const ViewLicenceService = require('./view-licence.service')

/**
 * Orchestrates fetching and presenting the data needed for the licence contact details page
 *
 * @param {string} licenceId - The UUID of the licence
 *
 * @returns {Promise<Object>} an object representing the `pageData` needed by the licence contact details  template.
 */
async function go (licenceId, auth) {
  const commonData = await ViewLicenceService.go(licenceId, auth)

  const data = ViewLicenceContactDetailsPresenter.go()

  return {
    ...commonData,
    ...data
  }
}

module.exports = {
  go
}
