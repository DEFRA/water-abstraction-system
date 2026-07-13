/**
 * Manages marking a submitted return for supplementary billing
 * @module SubmitConfirmedService
 */

import ProcessBillingFlagService from '../../licences/supplementary/process-billing-flag.service.js'
import ReturnLogModel from '../../../models/return-log.model.js'

/**
 * Manages marking a submitted return for supplementary billing
 *
 * @param {string} returnLogId - The UUID of the return log
 *
 * @returns {Promise<string>} The licenceId to use in the redirect
 */
export default async function submitConfirmed(returnLogId) {
  const { licenceId } = await ReturnLogModel.query()
    .findById(returnLogId)
    .select('licence.id AS licenceId')
    .innerJoinRelated('licence')

  await ProcessBillingFlagService({ returnLogId })

  return licenceId
}
