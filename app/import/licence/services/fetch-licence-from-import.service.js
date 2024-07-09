'use strict'

/**
 * Service for /import/licence
 * @module ImportLicenceService
 */
const { db } = require('../../../../db/db.js')

async function go (licenceRef) {
  const licence = await _getLicenceByRef(licenceRef)

  const { ID: id, FGAC_REGION_CODE: regionCode } = licence

  // TODO: rename these ? why section 130 ?
  const [tptAgreements, section130Agreements] = await Promise.all([
    _getTwoPartTariffAgreements(regionCode, id),
    _getSection130Agreements(regionCode, id)
  ])

  return {
    licence,
    section130Agreements,
    tptAgreements
  }
}

async function _getTwoPartTariffAgreements (regionCode, licenceId) {
  const query =
    `  SELECT a.*,
              cv."EFF_END_DATE" as charge_version_end_date,
              cv."EFF_ST_DATE"  as charge_version_start_date,
              cv."VERS_NO"      as version_number
       FROM import."NALD_CHG_VERSIONS" cv
                JOIN import."NALD_CHG_ELEMENTS" e
                     ON cv."FGAC_REGION_CODE" = e."FGAC_REGION_CODE" AND cv."VERS_NO" = e."ACVR_VERS_NO" AND
                        cv."AABL_ID" = e."ACVR_AABL_ID"
                JOIN import."NALD_CHG_AGRMNTS" a ON e."FGAC_REGION_CODE" = a."FGAC_REGION_CODE" AND e."ID" = a."ACEL_ID"
       WHERE cv."FGAC_REGION_CODE" = '${regionCode}'
         -- Exclude charge versions that have been replaced. We know a CV is replaced because it will have the same start and end date
         AND cv."EFF_END_DATE" <> cv."EFF_ST_DATE"
         AND cv."AABL_ID" = '${licenceId}'
         AND a."AFSA_CODE" = 'S127'
         AND concat_ws(':', cv."FGAC_REGION_CODE", cv."AABL_ID", cv."VERS_NO") in (
           -- Finds valid charge versions to select from.
           -- Draft charge versions are omitted.
           -- Where multiple charge versions begin on the same date,
           -- pick the one with the greatest version number.
           select concat_ws(':',
                            ncv."FGAC_REGION_CODE",
                            ncv."AABL_ID",
                            max(ncv."VERS_NO"::integer)::varchar
                  ) as id
           from import."NALD_CHG_VERSIONS" ncv
           where ncv."STATUS" <> 'DRAFT'
           group by ncv."FGAC_REGION_CODE", ncv."AABL_ID", ncv."EFF_ST_DATE")
       ORDER BY cv."VERS_NO"::integer;
    `

  const { rows } = await db.raw(query)

  return rows
}

async function _getSection130Agreements (regionCode, licenceId) {
  const query = `
      SELECT *
      FROM import."NALD_LH_AGRMNTS" ag
               JOIN (SELECT DISTINCT cv."FGAC_REGION_CODE", cv."AIIA_ALHA_ACC_NO"
                     FROM import."NALD_CHG_VERSIONS" cv
                     WHERE cv."FGAC_REGION_CODE" = '${regionCode}'
                       AND cv."AABL_ID" = '${licenceId}'
                       AND cv."STATUS" <> 'DRAFT') cv
                    ON ag."FGAC_REGION_CODE" = cv."FGAC_REGION_CODE" AND ag."ALHA_ACC_NO" = cv."AIIA_ALHA_ACC_NO"
                        AND ag."AFSA_CODE" IN ('S127', 'S130S', 'S130T', 'S130U', 'S130W')
  `

  const { rows } = await db.raw(query)

  return rows
}

async function _getLicenceByRef (licenceRef) {
  const query = `
      SELECT *
      FROM import."NALD_ABS_LICENCES" l
      WHERE l."LIC_NO" = '${licenceRef}';
  `

  const { rows: [row] } = await db.raw(query)

  return row
}

module.exports = {
  go
}
