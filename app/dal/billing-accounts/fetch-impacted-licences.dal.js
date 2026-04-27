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
 * @returns {Promise<object[]>} An array of charge version objects with their licenceRefs.
 */
async function go(billingAccountId) {
  const licenceRefs = await ChargeVersionModel.query()
    .select(['licenceRef'])
    .where('billingAccountId', billingAccountId)
    .where('status', 'current')

  const impactedLicences = licenceRefs.map((licence) => {
    return licence.licenceRef
  })

  return impactedLicences
}

module.exports = {
  go
}
