'use strict'

/**
 * @module TransformLicenceSupplementaryFlagsService
 */

const FetchLicenceChargeVersionsService = require('./fetch-licence-charge-versions.service.js')
const FlagForSupplementaryBillingPresenter = require('../../../presenters/import/legacy/flag-for-supplementary-billing.presenter.js')

/**
 * ha
 * @param {*} transformedLicence
 * @param {*} wrlsLicenceId
 * @returns
 */
async function go (transformedLicence, wrlsLicenceId) {
  const wrlsLicence = await FetchLicenceChargeVersionsService.go(wrlsLicenceId)

  await FlagForSupplementaryBillingPresenter.go(transformedLicence, wrlsLicence)
}

module.exports = {
  go
}
