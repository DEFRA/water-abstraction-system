'use strict'

/**
 * Fetches the licence document data from the import.NALD_ABS_LICENCES table for the licence being imported
 * @module FetchLicenceDocumentService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence document data from the import.NALD_ABS_LICENCES table for the licence being imported
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceDocumentType>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows: [row] } = await db.raw(query, [regionCode, licenceId])

  return row
}

function _query () {
  return `
    SELECT
      CASE
        WHEN
          NULLIF(nal."ORIG_EFF_DATE", 'null') IS NULL
          THEN MIN(TO_DATE(nalv."EFF_ST_DATE", 'DD/MM/YYYY' ))
        ELSE TO_DATE(nal."ORIG_EFF_DATE", 'DD/MM/YYYY')
        END
        as start_date,
      LEAST(
        TO_DATE(NULLIF(nal."LAPSED_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nal."REV_DATE", 'null'), 'DD/MM/YYYY'),
        TO_DATE(NULLIF(nal."EXPIRY_DATE", 'null'), 'DD/MM/YYYY')
      ) as end_date,
      nal."LIC_NO" as licence_ref
    FROM import."NALD_ABS_LICENCES" nal
      INNER JOIN import."NALD_ABS_LIC_VERSIONS" nalv
        ON nalv."FGAC_REGION_CODE" = nal."FGAC_REGION_CODE"
        AND nalv."AABL_ID" = nal."ID"
          AND NOT nalv."STATUS" = 'DRAFT'
    WHERE nalv."FGAC_REGION_CODE" = ? AND nalv."AABL_ID" = ?
    GROUP BY nal."FGAC_REGION_CODE", nal."ID", nal."LIC_NO", nal."ORIG_EFF_DATE", nal."EXPIRY_DATE", nal."REV_DATE", nal."LAPSED_DATE";
  `
}

module.exports = {
  go
}

/**
 * Representation of a licence document fetched from the NALD data
 * @typedef {object} ImportLegacyLicenceDocumentType
 *
 * @property {Date} start_date - The effective start date of the license.
 * @property {Date | null} end_date - The earliest of the lapsed, revision, or expiry dates.
 * @property {string} external_id - A combination of the region code and licence ID.
 * @property {string} licence_ref - The licence number.
 */
