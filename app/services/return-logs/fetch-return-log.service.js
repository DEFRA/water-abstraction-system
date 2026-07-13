/**
 * Fetches the return log needed for the view '/system/return-logs/{id}/communications' page
 * @module FetchReturnLogService
 */

import ReturnLogModel from '../../../app/models/return-log.model.js'

/**
 * Fetches the return log needed for the view '/system/return-logs/{id}/communications' page
 *
 * @param {string} returnLogId - The return log ID
 *
 * @returns {Promise<module:ReturnLogModel>} the return log and associated licence record
 */
export default async function fetchReturnLogService(returnLogId) {
  return ReturnLogModel.query()
    .findById(returnLogId)
    .select(['id'])
    .withGraphFetched('licence')
    .modifyGraph('licence', (licenceBuilder) => {
      licenceBuilder.select(['id', 'licenceRef'])
    })
}
