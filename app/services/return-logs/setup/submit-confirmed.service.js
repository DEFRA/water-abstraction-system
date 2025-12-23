'use strict'

/**
 * Manages marking a submitted return for supplementary billing
 * @module SubmitConfirmedService
 */

const ProcessBillingFlagService = require('../../licences/supplementary/process-billing-flag.service.js')
const ReturnLogModel = require('../../../models/return-log.model.js')

/**
 * Manages marking a submitted return for supplementary billing
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<string>} The licenceId to use in the redirect
 */
async function go(returnLogId) {
  const { licenceId } = await ReturnLogModel.query()
    .findById(returnLogId)
    .select('licence.id AS licenceId')
    .innerJoinRelated('licence')

  await ProcessBillingFlagService.go({ returnLogId })

  return licenceId
}

module.exports = {
  go
}
