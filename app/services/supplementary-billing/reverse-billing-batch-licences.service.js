'use strict'

/**
 * Takes a billing batch and licences and returns transactions which will reverse those licences on the billing batch
 * @module ReverseBillingBatchLicencesService
 */

/**
 * TODO: document
 *
 * @param {module:BillingBatchModel} billingBatch The billing batch we want to look for the licences
 * @param {Array[]} licences An array of licences to look for in the billing batch
 *
 * @returns {Array[]} Array of reversing transactions
 */
async function go (billingBatch, licences) {
  return billingBatch.billingBatchId
}

module.exports = {
  go
}
