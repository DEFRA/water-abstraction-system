'use strict'

/**
 * Assigns a bill run to licences with matching `LicenceSupplementaryYear` records
 * @module AssignBillRunToLicences
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

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
 * a supplementary bill run we use this service to assign the bill run ID to each record.
 *
 * Then, if a licence changes again a new licence supplementary year record will be created, because the systems that
 * manage this know to ignore those records with bill run IDs.
 *
 * If a licence is removed from a bill run, or the bill run is cancelled we'll remove the bill run ID. Else, when the
 * bill run is 'sent' the licence supplementary year records for that bill run will get deleted, as those licences will
 * be considered 'processed' for supplementary billing.
 *
 * @param {string} billRunId - The UUID of the bill run to assign the licences to
 * @param {object} billingPeriod - An object representing the financial year the bills will be for
 * @param {boolean} twoPartTariff - Whether we are assigning two-part tariff supplementary years to the bill run
 */
async function go(billRunId, billingPeriod, twoPartTariff) {
  const financialYearEnd = billingPeriod.endDate.getFullYear()

  await LicenceSupplementaryYearModel.query()
    .patch({ billRunId, updatedAt: timestampForPostgres() })
    .where('financialYearEnd', financialYearEnd)
    .where('twoPartTariff', twoPartTariff)
}

module.exports = {
  go
}
