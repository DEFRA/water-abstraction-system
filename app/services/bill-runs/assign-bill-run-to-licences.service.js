'use strict'

/**
 * Assigns a bill run to licences with matching `LicenceSupplementaryYear` records
 * @module AssignBillRunToLicencesService
 */

const { db } = require('../../../db/db.js')
const { timestampForPostgres } = require('../../lib/general.lib.js')

/**
 * Assigns a bill run to licences with matching `LicenceSupplementaryYear` records
 *
 * When a licence is changed, either directly because an 'end date' has changed, or indirectly via charge version,
 * return version, or return log changes it is flagged for supplementary billing.
 *
 * For two-part tariff licences, this means an entry is added to `water.licence_supplementary_years`. Should it change
 * again, we don't add another entry as it is _already_ flagged for supplementary billing.
 *
 * That is unless the licence is part of a two-part tariff supplementary bill run in progress. The state of the licence
 * at the time the bill run was triggered will have determined how, for example, returns were matched and allocated.
 *
 * To be sure nothing is missed, we want the service to process the licence for supplementary billing again, if a change
 * is made after a supplementary bill run is started.
 *
 * So, how do we make this happen? Each `licence_supplementary_year` record has a `bill_run_id` field. When we trigger
 * a supplementary bill run we use this service to assign the bill run ID to each record where
 *
 * - the licence is in the same region as the bill run
 * - the financial year matches the one the bill run is for
 * - the record has not already been assigned to another bill run
 *
 * Then, if a licence changes again a new licence supplementary year record can be created, because the systems that
 * manage this know to ignore those records with bill run IDs.
 *
 * If a licence is removed from a bill run, or the bill run is cancelled we'll remove the bill run ID. Else, when the
 * bill run is 'sent' the licence supplementary year records for that bill run will get deleted, as those licences will
 * be considered 'processed' for supplementary billing.
 *
 * @param {string} billRunId - The UUID of the bill run to assign the licences to
 */
async function go(billRunId) {
  const params = [billRunId, timestampForPostgres(), billRunId]
  const query = `
    UPDATE public.licence_supplementary_years lsy1 SET
      bill_run_id = ?,
      updated_at = ?
    WHERE EXISTS(
      SELECT
        1
      FROM
        public.licence_supplementary_years lsy2
      INNER JOIN public.licences l
        ON l.id = lsy2.licence_id
      INNER JOIN (
        SELECT
          br.id,
          br.region_id,
          br.to_financial_year_ending,
          (CASE
            WHEN br.batch_type = 'two_part_supplementary' THEN TRUE
            ELSE FALSE
          END) AS two_part_tariff
        FROM
          public.bill_runs br
        WHERE
          br.id = ?
      ) bill_run
        ON
          bill_run.region_id = l.region_id
          AND bill_run.to_financial_year_ending = lsy2.financial_year_end
          AND bill_run.two_part_tariff = lsy2.two_part_tariff
      WHERE
        lsy1.id = lsy2.id
        AND lsy2.bill_run_id IS NULL
    );
  `

  await db.raw(query, params)
}

module.exports = {
  go
}
