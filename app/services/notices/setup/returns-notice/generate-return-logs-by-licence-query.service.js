'use strict'

/**
 * Generates the query and bindings for selecting the return logs by licence that determine which recipients to fetch
 * @module GenerateReturnLogsByLicenceQueryService
 */

const { timestampForPostgres } = require('../../../../lib/general.lib.js')

/**
 * Generates the query and bindings for selecting the return logs by licence that determine which recipients to fetch
 *
 * @param {string} licenceRef - The licence reference to fetch return logs for
 *
 * @returns {object} The query to use as the 'due_return_logs` CTE in the recipients query, and the associated bindings
 */
function go(licenceRef) {
  const bindings = [timestampForPostgres(), licenceRef]

  return {
    bindings,
    query: _query()
  }
}

function _query() {
  return `
  SELECT
    rl.due_date,
    rl.end_date,
    rl.licence_ref,
    rl.return_id,
    rl.return_reference,
    rl.start_date
  FROM
    public.return_logs rl
  WHERE
    rl.status = 'due'
    AND rl.end_date < ?
    AND rl.licence_ref = ?
  `
}

module.exports = {
  go
}
