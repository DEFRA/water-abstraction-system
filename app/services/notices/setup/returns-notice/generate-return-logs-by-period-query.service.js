'use strict'

/**
 * Generates the query and bindings for selecting the return logs by period that determine which recipients to fetch
 * @module GenerateReturnLogsByPeriodQueryService
 */

const { NoticeType } = require('../../../../lib/static-lookups.lib.js')

const featureFlagsConfig = require('../../../../../config/feature-flags.config.js')

/**
 * Generates the query and bindings for selecting the return logs by period that determine which recipients to fetch
 *
 * @param {string} noticeType - The type of notice being generated
 * @param {string[]} licencesToExclude - An array of licence references whose return logs should be excluded
 * @param {object} returnsPeriod - Details for the returns period the notice is for
 *
 * @returns {object} The query to use as the 'due_return_logs` CTE in the recipients query, and the associated bindings
 */
function go(noticeType, licencesToExclude, returnsPeriod) {
  const { dueDate, endDate, startDate, quarterly, summer } = returnsPeriod
  const bindings = [startDate, endDate, summer, quarterly, licencesToExclude]

  if (!featureFlagsConfig.enableNullDueDate) {
    bindings.push(dueDate)
  }

  const dueDateCondition = _dueDateCondition(noticeType)

  return {
    bindings,
    query: _query(dueDateCondition)
  }
}

function _dueDateCondition(noticeType) {
  if (!featureFlagsConfig.enableNullDueDate) {
    return '?'
  }

  if (noticeType === NoticeType.REMINDERS) {
    return 'IS NOT NULL'
  }

  return 'IS NULL'
}

function _query(dueDateCondition) {
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
    AND rl.metadata->>'isCurrent' = 'true'
    AND rl.start_date >= ?
    AND rl.end_date <= ?
    AND rl.metadata->>'isSummer' = ?
    AND rl.quarterly = ?
    AND NOT (rl.licence_ref = ANY (?))
    AND rl.due_date ${dueDateCondition}
  `
}

module.exports = {
  go
}
