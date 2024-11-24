'use strict'

/**
 * Fetches existing supplementary details about a licence being updated during import
 * @module FetchExistingLicenceDetailsService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches existing supplementary details about a licence being updated during import
 *
 * We need to get the existing end dates so we can compare with those being imported to determine which have been
 * changed (it could be more than one).
 *
 * The query also determines what relevant charge versions exist for the licence. When processing the licence we have
 * to work out whether to set the include in presroc, include in sroc, and include in two-part tariff (by way of
 * supplementary billing years) flags on the licence.
 *
 * We can skip those steps if we know the licence being updated doesn't have the relevant charge versions. If it doesn't
 * have them, then it could never have been previously billed for them!
 *
 * @param {string} licenceId - The UUID of the licence details being fetched
 *
 * @returns {Promise<object>} - The data needed to determine which supplementary flags the licence needs
 */
async function go(licenceId) {
  const query = _query()

  const {
    rows: [row]
  } = await db.raw(query, [licenceId])

  return row
}

function _query() {
  return `
    SELECT
      l.id,
      l.expired_date,
      l.lapsed_date,
      l.revoked_date,
      (CASE l.include_in_presroc_billing
        WHEN 'yes' THEN TRUE
        ELSE FALSE
      END) AS flagged_for_presroc,
      l.include_in_sroc_billing AS flagged_for_sroc,
      EXISTS(
        SELECT
          1
        FROM
          public.charge_versions cv
        WHERE
          cv.licence_id = l.id
          AND cv.start_date < '2022-04-01'
      ) AS pre_sroc_charge_versions,
      EXISTS(
        SELECT
          1
        FROM
          public.charge_versions cv
        WHERE
          cv.licence_id = l.id
          AND cv.start_date > '2022-03-31'
      ) AS sroc_charge_versions,
      EXISTS(
        SELECT
          1
        FROM
          public.charge_versions cv
        INNER JOIN
          public.charge_references cr ON cr.charge_version_id = cv.id
        INNER JOIN
          public.charge_elements ce ON ce.charge_reference_id = cr.id
        WHERE
          cv.licence_id = l.id
          AND cv.start_date > '2022-03-31'
          AND cr.adjustments->>'s127' = 'true'
          AND ce.section_127_Agreement = TRUE
      ) AS two_part_tariff_charge_versions
    FROM
      public.licences l
    WHERE
      l.id = ?;
  `
}

module.exports = {
  go
}
