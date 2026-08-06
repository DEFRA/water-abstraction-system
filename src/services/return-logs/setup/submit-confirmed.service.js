/**
 * Manages marking a submitted return for supplementary billing
 * @module SubmitConfirmedService
 */

import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

import ProcessBillingFlagService from '../../licences/supplementary/process-billing-flag.service.js'

/**
 * Manages marking a submitted return for supplementary billing
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<string>} The licenceId to use in the redirect
 */
export default async function submitConfirmedService(returnLogId) {
  const { licenceId } = await ReturnLogModel.query()
    .findById(returnLogId)
    .select('licence.id AS licenceId')
    .innerJoinRelated('licence')

  await ProcessBillingFlagService({ returnLogId })

  return licenceId
}
