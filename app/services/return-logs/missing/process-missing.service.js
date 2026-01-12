'use strict'

/**
 * Find licences with missing one-day return logs and then create them
 * @module ProcessMissingReturnLogsService
 */

const ProcessLicenceReturnLogsService = require('../process-licence-return-logs.service.js')
const { db } = require('../../../../db/db.js')
const { calculateAndLogTimeTaken, currentTimeInNanoseconds } = require('../../../lib/general.lib.js')

/**
 * Find licences with missing one-day return logs and then create them
 *
 * > {@link https://eaflood.atlassian.net/browse/WATER-5443 | See WATER-5443 for more}
 *
 * This is a temporary service intended to be run once in production and then deleted (though it can be run multiple
 * times safely).
 *
 * It finds all licences that have ended (expired, lapsed or revoked) on the start date of a return cycle, but do not
 * have a return log for that date. It then creates the missing return logs by calling
 * `ProcessLicenceReturnLogsService`.
 *
 * The issue of missing return logs for the start of a period was initially spotted with quarterly return logs, but
 * after testing we found it would happen for standard (winter and summer) return logs as well. We updated `ProcessLicenceReturnLogsService` and the services it calls to ensure that when a licence ends on the start of a period
 * or cycle, the return log will be created correctly
 *
 * There were almost 200 missing one-day return logs when we looked, so we decided it would be easier to combine our
 * query to find them with the updated service that creates them in a one-off process, rather than trying to fix them
 * via a database migration.
 *
 * > After running this process the query will still return some results (6 at the time of writing). These are for
 * > licences that ended on the start date of a return cycle, but the return requirement for the licence ended before
 * > the return cycle start date. In these cases no return log should be created, so the process is considered
 * > successful if these remain.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const licencesWithMissingReturnLogs = await _fetch()

    for (const licenceWithMissingReturnLog of licencesWithMissingReturnLogs) {
      const { end_date: endDate, licence_id: licenceId, licence_ref: licenceRef } = licenceWithMissingReturnLog

      await ProcessLicenceReturnLogsService.go(licenceId, endDate)
      await _applyDueDate(licenceRef, endDate)
    }

    // Log the time it took to complete
    calculateAndLogTimeTaken(startTime, 'Process missing return logs complete', {
      count: licencesWithMissingReturnLogs?.length
    })
  } catch (error) {
    // Log any errors that occur
    global.GlobalNotifier.omfg('Process missing return logs failed', null, error)
  }
}

async function _applyDueDate(licenceRef, endDate) {
  if (endDate >= new Date('2025-04-01')) {
    return
  }

  const bindings = [licenceRef, endDate]

  const query = `
  WITH return_log_details AS (
    SELECT
      r.id,
      rc.due_date
    FROM
      "returns"."returns" r
    INNER JOIN "returns".return_cycles rc
      ON rc.return_cycle_id = r.return_cycle_id
    WHERE
      r.licence_ref = ?
      AND r.start_date = ?
      AND r.status = 'due'
      AND r.created_at > CURRENT_DATE
  )
  UPDATE "returns"."returns" r
  SET
    due_date = rld.due_date
  FROM
    return_log_details rld
  WHERE
    r.id = rld.id;
  `

  await db.raw(query, bindings)
}

async function _fetch() {
  const query = _query()

  const { rows } = await db.raw(query)

  return rows
}

function _query() {
  return `
  WITH ended_licences_with_rtns AS (
    SELECT
      l.licence_id,
      l.licence_ref,
      least(l.expired_date, l.lapsed_date, l.revoked_date) AS end_date
    FROM
      water.licences l
    WHERE
      least(l.expired_date, l.lapsed_date, l.revoked_date) IS NOT NULL
      AND EXISTS (
        SELECT
          1
        FROM
          "returns"."returns" r
        WHERE
          r.licence_ref= l.licence_ref
      )
  ),
  ended_licences_with_rtns_before_end AS (
    SELECT
      lwr.licence_id,
      lwr.licence_ref,
      lwr.end_date
    FROM
      ended_licences_with_rtns lwr
    WHERE
      EXISTS (
        SELECT
          1
        FROM
          "returns"."returns" r
        WHERE
          r.licence_ref= lwr.licence_ref
          AND r.start_date <= lwr.end_date
      )
  ),
  ended_licences_on_start_date AS (
    SELECT
      lbe.licence_id,
      lbe.licence_ref,
      lbe.end_date
    FROM
      ended_licences_with_rtns_before_end lbe
    WHERE
      lbe.end_date IN (
        SELECT rc.start_date FROM "returns".return_cycles rc
      )
  ),
  candidate_licences AS (
    SELECT
      lsd.licence_id,
      lsd.licence_ref,
      lsd.end_date
    FROM
      ended_licences_on_start_date lsd
    WHERE
      NOT EXISTS (
        SELECT 1 FROM "returns"."returns" r
        WHERE
          r.licence_ref = lsd.licence_ref
          AND (r.start_date = lsd.end_date OR r.end_date = lsd.end_date)
      )
  )
  SELECT cl.* FROM candidate_licences cl;
  `
}

module.exports = {
  go
}
