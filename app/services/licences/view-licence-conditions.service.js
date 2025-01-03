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
  const licenceVersionPurposeConditionTypes = await FetchLicenceConditionsService.go(licenceId)

  console.dir(licenceVersionPurposeConditionTypes, { depth: null, colors: true })

  const pageData = ViewLicenceConditionsPresenter.go(licenceVersionPurposeConditionTypes)

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
