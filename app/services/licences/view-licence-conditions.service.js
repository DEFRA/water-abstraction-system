'use strict'

const FetchLicenceConditionsService = require('./fetch-licence-conditions.service.js')
const ViewLicenceConditionsPresenter = require('../../presenters/licences/view-licence-conditions.presenter.js')

/**
 * Calls the licence abstraction conditions presenter
 *
 * @param {string} licenceId
 * @returns
 */
async function go(licenceId) {
  const licence = await FetchLicenceConditionsService.go(licenceId)

  const pageData = ViewLicenceConditionsPresenter.go(licence)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
