'use strict'

/**
 * Fetches stuff
 * @module CanIStubThisOneService
 */

const ReviewChargeReferenceModel = require('../models/review-charge-reference.model.js')

/**
 * Fetches stuff
 *
 * @param chargeReferenceId It is what it is
 * @returns {Promise<object>} Contains an array of stuff
 */
async function go (chargeReferenceId) {
  const results = await ReviewChargeReferenceModel.query()
    .findById(chargeReferenceId)
    .select('id', 'amendedAuthorisedVolume')
    .withGraphFetched('chargeReference')
    .modifyGraph('chargeReference', (builder) => {
      builder.select([
        'chargeCategoryId'
      ])
    })
    .withGraphFetched('chargeReference.chargeCategory')
    .modifyGraph('chargeReference.chargeCategory', (builder) => {
      builder.select([
        'shortDescription',
        'minVolume',
        'maxVolume'
      ])
    })
    .withGraphFetched('reviewChargeVersion')
    .modifyGraph('reviewChargeVersion', (builder) => {
      builder.select([
        'chargePeriodStartDate',
        'chargePeriodEndDate'
      ])
    })
    .withGraphFetched('reviewChargeElements')
    .modifyGraph('reviewChargeElements', (builder) => {
      builder.select([
        'amendedAllocated'
      ])
    })

  return results
}

module.exports = {
  go
}
