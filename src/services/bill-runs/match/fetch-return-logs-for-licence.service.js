/**
 * Fetches SROC return logs linked to licences flagged for inclusion in next SROC 2PT billing
 * @module FetchReturnLogsForLicenceService
 */

import ExpandedError from 'water-abstraction-engine/errors/expanded.error.js'

import FetchReturnLogsForLicenceDal from '../../../dal/bill-runs/match/fetch-return-logs-for-licence.dal.js'

/**
 * Fetch all SROC return logs to be processed as part of two-part-tariff billing
 * *
 * @param {string} licenceRef - The reference of the licence that the return log relates to
 * @param {object} billingPeriod - Object with a `startDate` and `endDate` property representing the period being billed
 *
 * @returns {Promise<object>} Contains an array of `returnLogs` and the associated current `returnSubmissions`, and
 * `returnSubmissionLines` if they exist
 */
export default async function fetchReturnLogsForLicenceService(licenceRef, billingPeriod) {
  const returnLogs = await FetchReturnLogsForLicenceDal(licenceRef, billingPeriod)

  _checkAbstractionPeriodExists(licenceRef, returnLogs)

  return returnLogs
}

/**
 * Checks whether the return log is missing the abstraction period data and logs and throws an error if it doesn't exist
 *
 * We found out that it is possible to set up return requirements in NALD with empty abstraction periods. This then
 * causes the return log to also be missing abstraction period data.
 *
 * We throw the error so that the bill run will be set to 'errored'. We know this will result in us having to
 * investigate the issue, but with this additional logging we should be able to quickly see which licence caused the
 * error and why.
 *
 * If we don't throw the error then the bill run will complete without the return log being picked up. This would result
 * in an incorrect bill run because the submission would not have been picked up for allocation.
 *
 * @private
 */
function _checkAbstractionPeriodExists(licenceRef, returnLogs) {
  const missingAbstractionPeriod = returnLogs.some((returnLog) => {
    return returnLog.periodStartDay === null
  })

  if (missingAbstractionPeriod) {
    globalThis.GlobalNotifier.omg(
      `Bill run fetch return logs for licence failed for licence ${licenceRef} due to missing abstraction period`,
      { returnLogs }
    )

    throw new ExpandedError(`Return log is missing abstraction period data for licence ${licenceRef}`, { returnLogs })
  }
}
