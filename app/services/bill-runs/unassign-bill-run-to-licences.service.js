/**
 * Unassigns a bill run from licences with matching `LicenceSupplementaryYear` records
 * @module UnassignBillRunToLicencesService
 */

import { timestampForPostgres } from '../../lib/general.lib.js'
import LicenceSupplementaryYearModel from '../../models/licence-supplementary-year.model.js'

/**
 * Unassigns a bill run from licences with matching `LicenceSupplementaryYear` records
 *
 * This function removes the association between a bill run and licences by setting the `bill_run_id` to null for all
 * `LicenceSupplementaryYear` records that have the specified `billRunId`.
 *
 * @param {string} billRunId - The UUID of the bill run to be unassigned from the licences
 */
export default async function unassignBillRunToLicencesService(billRunId) {
  await LicenceSupplementaryYearModel.query()
    .patch({ billRunId: null, updatedAt: timestampForPostgres() })
    .where('billRunId', billRunId)
}
