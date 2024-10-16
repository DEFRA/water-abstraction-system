'use strict'

/**
 * Fetches stuff
 * @module CanIStubThisOneService
 */

const ReviewChargeReferenceModel = require('../models/review-charge-reference.model.js')

/**
 * Fetches stuff
 *
 * @returns {Promise<object>} Contains an array of stuff
 */
async function go () {
  const allTheStuff = await ReviewChargeReferenceModel.query()
    .findById('ba4943d5-2ac3-4f7f-b8a1-b1b72da6d096')
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

  return allTheStuff
}

module.exports = {
  go
}
