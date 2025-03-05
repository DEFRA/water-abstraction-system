'use strict'

/**
 * Unassigns licences from a supplementary bill run
 * @module UnassignLicencesToBillRunService
 */

const { timestampForPostgres } = require('../../lib/general.lib.js')
const LicenceSupplementaryYearModel = require('../../models/licence-supplementary-year.model.js')

/**
 * Unassigns licences from a supplementary bill run
 *
 * Sets the `billRunId` field to null for the `LicenceSupplementaryYear` records that match the provided licence IDs
 * and bill run ID.
 *
 * @param {string[]} licenceIds - The UUIDs of the licences to be unassigned from a bill run
 * @param {string} billRunId - The UUID of the bill run to be unassigned from the licences
 */
async function go(licenceIds, billRunId) {
  await LicenceSupplementaryYearModel.query()
    .patch({ billRunId: null, updatedAt: timestampForPostgres() })
    .whereIn('licenceId', licenceIds)
    .where('billRunId', billRunId)
}

module.exports = {
  go
}
