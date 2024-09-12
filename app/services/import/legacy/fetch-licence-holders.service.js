'use strict'

/**
 * Fetches the Licence Holder data from the import.NALD_PARTIES table for the licence ref
 * @module FetchLicenceHolderService
 */

const { db } = require('../../../../db/db.js')

/**
 * Fetches the licence holder data from the import.NALD_PARTIES table for the licence ref
 *
 * The licence holder is determined from the import.NALD_ABS_LIC_VERSIONS table. We get the earliest start date
 *
 * @param {string} regionCode - The NALD region code
 * @param {string} licenceId - The NALD licence ID
 *
 * @returns {Promise<ImportLegacyLicenceHolderType[]>}
 */
async function go (regionCode, licenceId) {
  const query = _query()

  const { rows } = await db.raw(query, [regionCode, licenceId])

  return rows
}

function _query () {
  return `
    SELECT DISTINCT ON (np."ID")
      (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS company_external_id,
      (concat_ws(':', np."FGAC_REGION_CODE", np."ID")) AS contact_external_id,
      to_date(nalc."EFF_ST_DATE", 'DD/MM/YYYY') as start_date,
      lr.id as licence_role_id
    FROM import."NALD_PARTIES" np
           INNER JOIN import."NALD_ABS_LIC_VERSIONS" nalc
                      ON nalc."FGAC_REGION_CODE" = np."FGAC_REGION_CODE"
                        AND nalc."ACON_APAR_ID" = np."ID"
           INNER JOIN public.licence_roles lr
                      ON lr.name = 'licenceHolder'
    WHERE nalc."FGAC_REGION_CODE" = ?
      AND nalc."AABL_ID" = ?
      AND np."APAR_TYPE" != 'ORG'
    ORDER BY  np."ID", TO_DATE(nalc."EFF_ST_DATE", 'DD/MM/YYYY') ASC

  `
}

module.exports = {
  go
}

/**
 * @typedef {object} ImportLegacyLicenceHolderType
 *
 * @property {string} company_external_id - The company external ID, formatted as 'FGAC_REGION_CODE:ID'.
 * @property {string} contact_external_id - The contact external ID, formatted as 'FGAC_REGION_CODE:ID'.
 * @property {Date} start_date - earliest start date for the licence holder
 * @property {uuid} licence_role_id - the licence role id for the licence holder
 *
 */
