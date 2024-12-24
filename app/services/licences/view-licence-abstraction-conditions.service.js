'use strict'

const FetchLicenceAbstractionConditionsService = require('../../services/licences/fetch-licence-abstraction-conditions.service.js')
const ViewLicenceAbstractionConditionsPresenter = require('../../presenters/licences/view-licence-abstraction-conditions.presenter.js')
const FetchTestService = require('./fetch-test.service.js')

const util = require('util')

/**
 * Calls the licence abstraction conditions presenter
 *
 * @param {string} licenceId
 * @returns
 */
async function go(licenceId) {
  const licence = await FetchLicenceAbstractionConditionsService.go(licenceId)
  const conditionsTest = await FetchTestService.go(licenceId)
  // console.log('🚀🚀🚀 ~ conditionsTest:', conditionsTest)
  console.log('🚀🚀🚀 ~ conditionsTest: ', util.inspect(conditionsTest, false, null, true /* enable colors */))

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
