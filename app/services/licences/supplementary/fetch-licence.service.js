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
 * NOTE: We do not care about pre sroc charge versions. We are not updating the `include_in_pre_sroc_billing` flag due
 * to using the old billing engine that then generates £0 bill runs. Only our new sroc billing engines can handle £0
 * bill runs. We fetch the column so we can persist the flag that is already there.
 *
 * @param {string} workflowId - The UUID for the workflow record related to the licence
 *
 * @returns {Promise<object>} - The data needed to determine which supplementary flags the licence needs
 */
async function go (workflowId) {
  const query = _query()

  const { rows: [row] } = await db.raw(query, [workflowId])

  return row
}

function _query () {
  return `
    SELECT
    l.include_in_sroc_billing,
    l.include_in_presroc_billing,
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
    CASE
      WHEN l.lapsed_date <= CURRENT_DATE OR l.revoked_date <= CURRENT_DATE OR l.expired_date <= CURRENT_DATE
      THEN TRUE
      ELSE FALSE
    END AS ended
    FROM licences l
    INNER JOIN workflows w
      ON l.id = w.licence_id
    WHERE w.id = ?
`
}

module.exports = {
  go
}
