'use strict'

/**
 * Generates the query and bindings for selecting the return logs by Id that determine which recipients to fetch
 * @module GenerateReturnLogsByIdQueryService
 */

/**
 * Generates the query and bindings for selecting the return logs by Id that determine which recipients to fetch
 *
 * @param {string[]} returnLogIds - The return log IDs to fetch return logs for
 *
 * @returns {object} The query to use as the 'due_return_logs` CTE in the recipients query, and the associated bindings
 */
function go(returnLogIds) {
  const bindings = [returnLogIds]

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
    AND rl.return_id = ANY (?)
  `
}

module.exports = {
  go
}
