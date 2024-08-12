'use strict'

/**
 * Orchestrates flagging a licence for supplementary billing
 * @module FlagSupplementaryBillingService
 */

const ChargeVersionModel = require('../../models/charge-version.model.js')

/**
 * Orchestrates flagging a licence for supplementary billing
 *
 * @param {String} payload - The UUID for the bill run
 */
async function go (payload) {
  if (payload.chargeVersionId) {
    const chargeVersion = await ChargeVersionModel.query()
      .findById(payload.chargeVersionId)
      .withGraphFetched('chargeReferences')
      .modifyGraph('chargeReferences', (builder) => {
        builder.select([
          'id',
          'section127Agreement',
          'adjustments'
        ])
      })

    console.log('Charge Versions :', chargeVersion)
  }
}

module.exports = {
  go
}
