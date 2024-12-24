'use strict'

const FetchLicenceAbstractionConditionsService = require('../../services/licences/fetch-licence-abstraction-conditions.service.js')
const ViewLicenceAbstractionConditionsPresenter = require('../../presenters/licences/view-licence-abstraction-conditions.presenter.js')

// const util = require('util')

/**
 * Calls the licence abstraction conditions presenter
 *
 * @param {string} licenceId
 * @returns
 */
async function go(licenceId) {
  const licence = await FetchLicenceAbstractionConditionsService.go(licenceId)

  const pageData = ViewLicenceAbstractionConditionsPresenter.go(licence)
  // console.log('🚀🚀🚀 ~ Conditions: ', util.inspect(pageData, false, null, true /* enable colors */))

  return {
    activeNavBar: 'search',
    ...pageData
  }
}

module.exports = {
  go
}
