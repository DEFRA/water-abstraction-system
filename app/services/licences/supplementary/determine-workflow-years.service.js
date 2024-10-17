'use strict'

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing
 * @module DetermineWorkflowYearsService
 */

const FetchLicenceService = require('./fetch-licence.service.js')
const { determineCurrentFinancialYear } = require('../../../lib/general.lib.js')
const LicenceModel = require('../../../models/licence.model.js')

/**
 * Determines if a licence being removed from workflow should be flagged for supplementary billing.
 *
 * The service is passed the id of a workflow record and determines if it should be flagged for supplementary
 * billing. This is worked out based on the licences charge information data. If the licence has any charge versions
 * that are sroc and two-part tariff then flagForBilling is set to true.
 *
 * @param {string} workflowId - The UUID for the workflow record to fetch
 *
 * @returns {object} - An object containing the related licence, charge information start and end date and if the
 * licence should be flagged for two-part tariff supplementary billing
 */
async function go (workflowId) {
  const licence = await FetchLicenceService.go(workflowId)
  const { endDate } = determineCurrentFinancialYear()

  // Due to the fact the database gives us the licence back in snake case, we need to convert the references to camel
  // case so the rest of the flagging service can use it
  const result = {
    licence: {
      id: licence.id,
      regionId: licence.region_id
    },
    startDate: licence.created_at,
    endDate,
    twoPartTariff: licence.two_part_tariff_charge_versions,
    flagForBilling: false
  }

  // If a licence is already flagged for supplementary billing then we don't need to flag it again
  // We only want to flag licences that have sroc charge versions
  if (!licence.include_in_sroc_billing && licence.sroc_charge_versions) {
    await _flagForSrocSupplementary(licence.id)
  }

  result.flagForBilling = result.twoPartTariff

  return result
}

async function _flagForSrocSupplementary (id) {
  return LicenceModel.query().patch({ includeInSrocBilling: true }).where('id', id)
}

module.exports = {
  go
}
