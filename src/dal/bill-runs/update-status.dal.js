/**
 * Updates a bill runs status
 * @module UpdateStatusDal
 */

import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Updates a bill runs status
 *
 * @param {string} billRunId - The UUID for the bill run to patch
 * @param {string} status - The bill runs new status
 */
export default async function updateStatusDal(billRunId, status) {
  await BillRunModel.query().findById(billRunId).patch({ status, updatedAt: timestampForPostgres() })
}
