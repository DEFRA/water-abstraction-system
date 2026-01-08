'use strict'

/**
 * Generates the query and bindings for selecting the return logs by licence that determine which recipients to fetch
 * @module GenerateReturnLogsByLicenceQueryService
 */

const { timestampForPostgres } = require('../../../../lib/general.lib.js')
const { NoticeType } = require('../../../../lib/static-lookups.lib.js')

/**
 * Generates the query and bindings for selecting the return logs by licence that determine which recipients to fetch
 *
 * @param {string} licenceRef - The licence reference to fetch return logs for
 * @param {string} noticeType - The type of notice being sent
 *
 * @returns {object} The query to use as the 'due_return_logs` CTE in the recipients query, and the associated bindings
 */
function go(licenceRef, noticeType) {
  const bindings = [timestampForPostgres(), licenceRef]

  return {
    bindings,
    query: _query(noticeType)
  }
}

function _query(noticeType) {
  return `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.id AS return_log_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.end_date < ?
    AND rl.licence_ref = ?
${noticeType === NoticeType.REMINDERS ? '    AND rl.due_date IS NOT NULL' : ''}`
}

module.exports = {
  go
}
