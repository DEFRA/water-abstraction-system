/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 * @module FetchReturnsDal
 */

import DatabaseConfig from 'water-abstraction-engine/config/database.config.js'
import Objection from 'water-abstraction-engine/wrappers/objection.wrapper.js'
import ReturnLogModel from 'water-abstraction-engine/models/return-log.model.js'

/**
 * Fetches all return logs for a licence which is needed for the view '/licences/{id}/returns` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch
 * @param {string} [page=1] - The current page for the pagination service
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's returns tab
 */
export default async function fetchReturnsService(licenceId, page = '1') {
  const { results: returns, total: totalNumber } = await _fetch(licenceId, page)

  return { returns, totalNumber }
}

async function _fetch(licenceId, page) {
  // NOTE: Because the return references are held in a varchar field, we have to convert them to an integer in our
  // order by for the results to be ordered as expected. Hence, we need to use orderByRaw()
  //
  // NOTE: The purposes are aggregated in a correlated sub-query to keep the result to one row per return log. As the
  // sub-query has no GROUP BY it always returns a single row, and JSON_AGG() returns null when nothing matched, hence
  // the COALESCE() so a return requirement with no purposes gives us an empty array
  return ReturnLogModel.query()
    .select([
      'returnLogs.id',
      'returnLogs.dueDate',
      'returnLogs.endDate',
      'returnLogs.returnId',
      'returnLogs.returnReference',
      'returnLogs.startDate',
      'returnLogs.status',
      'returnRequirement.siteDescription'
    ])
    .select(
      ReturnLogModel.relatedQuery('returnRequirement')
        .innerJoinRelated('returnRequirementPurposes')
        .innerJoin('purposes', 'purposes.id', 'returnRequirementPurposes.purposeId')
        .select(Objection.raw("COALESCE(JSON_AGG(purposes.description ORDER BY purposes.description), '[]'::json)"))
        .as('purposes')
    )
    .innerJoinRelated('licence')
    .innerJoinRelated('returnRequirement')
    .where('licence.id', licenceId)
    .orderByRaw('return_logs.start_date desc, return_logs.return_reference::integer desc, return_logs.end_date desc')
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}
