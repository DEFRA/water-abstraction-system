'use strict'

/**
 * Fetches licence references for the provided billing account id.
 * @module FetchImpactedLicences
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')

/**
 * Fetches licence references for the provided billing account id.
 *
 * When changing the addess for a billing account we show the user a list of the licences impacted by the change. This
 * services returns all the linked licence references for the provided billing account id.
 *
 * @param {string} billingAccountId - The UUID of the billing account.
 *
 * @returns {Promise<string[]>} The `licenceRef` of the impacted licences.
 */
async function go(billingAccountId) {
  const chargeVersions = await ChargeVersionModel.query()
    .select(['licenceRef'])
    .where('billingAccountId', billingAccountId)
    .where('status', 'current')
    .distinctOn('licenceRef')
    .orderBy('licenceRef')

  const impactedLicences = chargeVersions.map((chargeVersion) => {
    return chargeVersion.licenceRef
  })

  return impactedLicences
}

module.exports = {
  go
}
