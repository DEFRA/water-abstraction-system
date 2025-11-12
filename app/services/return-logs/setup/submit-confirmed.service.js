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
 * @param {string} returnId - The UUID of the return log
 *
 * @returns {Promise<string>} The licenceId to use in the redirect
 */
async function go(returnId) {
  const { licenceId, returnLogId } = await ReturnLogModel.query()
    .select('licence.id AS licenceId', 'returnLogs.id AS returnLogId')
    .innerJoinRelated('licence')
    .where('returnLogs.returnId', returnId)
    .first()

  await ProcessBillingFlagService.go({ returnLogId })

  return licenceId
}

module.exports = {
  go
}
