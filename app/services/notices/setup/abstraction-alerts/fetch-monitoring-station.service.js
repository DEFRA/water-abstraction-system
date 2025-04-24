'use strict'

/**
 * Orchestrates fetching the data needed for the Monitoring station journey
 * @module FetchMonitoringStationService
 */

const { db } = require('../../../../../db/db.js')

/**
 * Orchestrates fetching the data needed for the Monitoring station journey
 *
 * @param {string} id
 * @returns {Promise<{object}>}
 */
async function go(id) {
  const { rows } = await _fetch(id)

  return rows
}

async function _fetch(id) {
  const query = _query()
  const params = [id, id]

  return db.raw(query, params)
}

/**
 * Fetches monitoring station data by ID, joining multiple related tables for full context.
 *
 * This function uses two `SELECT` queries combined with `UNION ALL` to fetch monitoring station data
 * for two distinct cases:
 *
 * 1. Records where `licence_version_purpose_condition_id` is `NULL`:
 *    - These pull abstraction period data directly from `licence_monitoring_stations`.
 *
 * 2. Records where `licence_version_purpose_condition_id` is *not* `NULL`:
 *    - These retrieve abstraction period data via a join to `licence_version_purpose_conditions`
 *      and then `licence_version_purposes`.
 *
 * A single query with a `LEFT JOIN` would not be appropriate because:
 * - The source of the abstraction period data differs depending on the presence of the condition ID.
 * - Using `UNION ALL` avoids mixing fields and makes the logic clearer and easier to maintain.
 *
 * @private
 */
function _query() {
  return `select
    ms.label,
    lms.abstraction_period_start_day,
    lms.abstraction_period_start_month,
    lms.abstraction_period_end_day,
    lms.abstraction_period_end_month,
    lms.measure_type,
    lms.restriction_type,
    lms.threshold_value,
    lms.threshold_unit,
    lms.status,
    lms.status_updated_at,
    lms.licence_version_purpose_condition_id,
    l.licence_id,
    l.licence_ref,
    l.start_date
from
    public.monitoring_stations ms
        join public.licence_monitoring_stations lms on
        (lms.monitoring_station_id = ms.id)
        join water.licences l on
        (l.licence_id = lms.licence_id)
where
    lms.licence_version_purpose_condition_id is null
  and lms.deleted_at is null
  and  ms.id=?
union all
select
    ms.label,
    lvp.abstraction_period_start_day,
    lvp.abstraction_period_start_month,
    lvp.abstraction_period_end_day,
    lvp.abstraction_period_end_month,
    lms.measure_type,
    lms.restriction_type,
    lms.threshold_value,
    lms.threshold_unit,
    lms.status,
    lms.status_updated_at,
    lms.licence_version_purpose_condition_id,
    l.licence_id,
    l.licence_ref,
    l.start_date
from
    public.monitoring_stations ms
        join public.licence_monitoring_stations lms on
        (lms.monitoring_station_id = ms.id)
        join water.licences l on
        (l.licence_id = lms.licence_id)
        join public.licence_version_purpose_conditions lvpc on
        lvpc.id = lms.licence_version_purpose_condition_id
        join public.licence_version_purposes lvp on
        lvp.id = lvpc.licence_version_purpose_id
where
    lms.licence_version_purpose_condition_id is not null
  and lms.deleted_at is null
  and  ms.id=?`
}

module.exports = {
  go
}
