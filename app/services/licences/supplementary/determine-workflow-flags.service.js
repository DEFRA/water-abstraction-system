'use strict'

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing
 * @module DetermineWorkflowFlagsService
 */

const BillRunModel = require('../../../models/bill-run.model.js')
const FetchLicenceService = require('./fetch-licence.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')

/**
 * Determines if a licence should be flagged for supplementary billing when removed from workflow
 *
 * When a user removes a licence from workflow (either by using the "remove" button in the workflows tab or
 * by canceling a charge version awaiting approval), this action does not alter the licence charge information.
 * However, supplementary billing flags are necessary in this case because any licence in workflow is excluded
 * from the annual billing cycle. If a licence is in workflow when its region's annual billing run occurs, it
 * would be missed for that financial year and will need to be included in the supplementary bill run.
 *
 * The service only focuses on the sroc and two-part tariff supplementary flags. Since only sroc annual billing is
 * active (effective from April 1, 2022), licences coming through to this service will not require pre-sroc flagging.
 *
 * The service uses the workflows createdAt date and the licences regionId to check if any annual bill runs occurred
 * while the licence was in workflow.
 * If the licence is lapsed, expired or revoked the existing flags are returned unchanged.
 *
 * As the service always persists the flags, we set the pre-sroc supplementary flag to what the licence already has,
 * to make sure we don't falsely remove it.
 *
 * The flags are then passed back to the service, where it will work out which years the two-part tariff flags should be
 * applied to.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year.
 *
 * @param {string} workflowId - The UUID for the workflow record to fetch
 *
 * @returns {object} - An object containing the related licenceId, regionId, workflow start and end date and
 * licence supplementary billing flags
 */
async function go(workflowId) {
  const licence = await FetchLicenceService.go(workflowId)
  const { endDate } = determineCurrentFinancialYear()

  // Since the database returns the licence data in snake_case, we need to convert these references to camelCase
  // to ensure compatibility with other services that use this result.
  const result = {
    licenceId: licence.id,
    regionId: licence.region_id,
    startDate: licence.created_at,
    endDate,
    flagForPreSrocSupplementary: licence.include_in_presroc_billing === 'yes',
    flagForSrocSupplementary: licence.include_in_sroc_billing,
    flagForTwoPartTariffSupplementary: licence.ended ? false : licence.two_part_tariff_charge_versions
  }

  // If the licence has ended then we don't want to add any new flags
  if (licence.ended) {
    return result
  }

  await _updateFlags(licence, result)

  return result
}

async function _updateFlags(licence, result) {
  // If the licence is not already flagged for SROC billing and has SROC charge versions we check if it needs to be
  // flagged
  if (licence.sroc_charge_versions && !licence.include_in_sroc_billing) {
    result.flagForSrocSupplementary = await _flagForSrocSupplementary(licence.created_at, licence.region_id)
  }

  // If the licence is flagged for SRoC billing but has no SRoC charge versions, remove the flag as the licence cannot
  // be included in a supplementary bill run without charge versions.
  if (!licence.sroc_charge_versions && licence.include_in_sroc_billing) {
    result.flagForSrocSupplementary = false
  }
}

/**
 * Checks if a licence should be flagged for SRoC supplementary billing based on recent annual bill runs.
 *
 * Searches for any annual bill runs that have been created since the workflow records `createdAt` date. Uses the
 * licence region, batch type and bill run status as criteria.
 *
 * Flags the licence for supplementary billing if any eligible bill runs are found.
 *
 * @private
 */
async function _flagForSrocSupplementary(createdAt, regionId) {
  const recordCount = await BillRunModel.query()
    .where('createdAt', '>=', createdAt)
    .where('batchType', 'annual')
    .whereIn('status', ['sent', 'sending', 'ready', 'review'])
    .where('regionId', regionId)
    .resultSize()

  return recordCount > 0
}

module.exports = {
  go
}
