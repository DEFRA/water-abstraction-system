'use strict'

/**
 * Fetches existing supplementary details about a licence being removed from workflow
 * @module FetchLicenceService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches existing supplementary details about a licence being removed from workflow
 *
 * We need to get the `created at` date from the workflow record to determine which supplementary years we need to flag.
 * The query also determines what sroc or two-part tariff charge versions the licence has.
 *
 * When processing the flags we have to work out whether to include the licence in sroc supplementary billing or in
 * two-part tariff supplementary billing.
 *
 * NOTE: We do not care about pre sroc charge versions. We are not setting the `include_in_pre_sroc_billing` flag due to
 * using the old billing engine that then generates £0 bill runs. Only our new sroc billing engines can handle £0 bill
 * runs.
 *
 * @param {string} chargeVersionWorkflowId - The UUID for the workflow record related to the licence
 *
 * @returns {Promise<object>} - The data needed to determine which supplementary flags the licence needs
 */
async function go (chargeVersionWorkflowId) {
  const query = _query()

  const { rows: [row] } = await db.raw(query, [chargeVersionWorkflowId])

  return row
}

function _query () {
  return `
    SELECT
    l.include_in_sroc_billing,
    l.id,
    l.region_id,
    EXISTS (
      SELECT 1
      FROM public.charge_versions cv
      WHERE cv.licence_id = l.id
        AND cv.start_date > '2022-03-31'
    ) AS sroc_charge_versions,
    EXISTS (
      SELECT 1
      FROM public.charge_references cr
      INNER JOIN public.charge_elements ce
        ON ce.charge_reference_id = cr.id
      WHERE cr.charge_version_id = (
        SELECT cv.id
        FROM public.charge_versions cv
        WHERE cv.licence_id = l.id
          AND cv.start_date > '2022-03-31'
        LIMIT 1
      )
      AND ce.section_127_Agreement = TRUE
      AND cr.adjustments->>'s127' = 'true'
    ) AS two_part_tariff_charge_versions,
    w.created_at
    FROM licences l
    CROSS JOIN (
    SELECT w.licence_id, w.created_at
    FROM workflows w
    WHERE w.id = ?
    ) w
    WHERE l.id = w.licence_id
`
}

module.exports = {
  go
}
