/**
 * Sets a bill runs status to processing
 * @module MarkAsProcessingDal
 */

import BillRunModel from 'water-abstraction-engine/models/bill-run.model.js'
import { timestampForPostgres } from 'water-abstraction-engine/lib/general.lib.js'

/**
 * Sets a bill runs status to processing
 *
 * @param {string} billRunId - The UUID for the bill run to patch
 */
export default async function markAsProcessingDal(billRunId) {
  await BillRunModel.query().findById(billRunId).patch({ status: 'processing', updatedAt: timestampForPostgres() })
}
