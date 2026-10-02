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
  // NOTE: The purposes are aggregated in a correlated sub-query to keep the result to one row per return log. As the
  // sub-query has no GROUP BY it always returns a single row, and JSON_AGG() returns null when nothing matched, hence
  // the COALESCE() so a return log with no return requirement, or one with no purposes, gives us an empty array
  return ReturnLogModel.query()
    .select([
      'returnLogs.id',
      'returnLogs.dueDate',
      'returnLogs.endDate',
      'returnLogs.returnId',
      'returnLogs.startDate',
      'returnLogs.status',
      // NOTE: return_logs.return_reference is a varchar whereas return_requirements.reference is an integer. We cast
      // so both sides of the COALESCE() match, and so the result sorts numerically rather than alphabetically
      Objection.raw('COALESCE(return_requirement.reference, return_logs.return_reference::integer)').as(
        'returnReference'
      ),
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
    .leftJoinRelated('returnRequirement')
    .where('licence.id', licenceId)
    .orderBy([
      { column: 'returnLogs.startDate', order: 'desc' },
      { column: 'returnReference', order: 'desc' },
      { column: 'returnLogs.endDate', order: 'desc' }
    ])
    .page(Number(page) - 1, DatabaseConfig.defaultPageSize)
}
