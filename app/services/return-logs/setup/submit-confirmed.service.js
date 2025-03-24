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
 * @returns {string} The licenceId to use in the redirect
 */
async function go(returnId) {
  const { licenceId } = await ReturnLogModel.query()
    .findById(returnId)
    .select('licence.id AS licenceId')
    .innerJoinRelated('licence')

  await ProcessBillingFlagService.go({ returnId })

  return licenceId
}

module.exports = {
  go
}
