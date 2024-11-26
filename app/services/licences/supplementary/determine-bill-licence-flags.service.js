'use strict'

/**
 * Determines what supplementary billing flag should be added to a licence removed from a bill run
 * @module DetermineBillLicenceFlagsService
 */

const BillLicenceModel = require('../../../models/bill-licence.model.js')

/**
 * Determines which supplementary billing flag should be added to a licence that is removed from a bill run.
 *
 * When a user removes a licence from a bill run, a flag needs to be added to the licence so it can be picked up in the
 * next supplementary bill run.
 * This service handles licences being removed from:
 * - An annual sroc bill run (pre-sroc annual bill runs can no longer be run)
 * - Sroc supplementary bill runs
 * - Pre sroc supplementary bill runs
 * - Two-part tariff annual bill runs
 * - Two-part tariff supplementary bill runs
 *
 * Removing a licence from a pre-sroc two-part tariff supplementary bill run is handled in a separate service
 * (DetermineLicenceFlagsService).
 *
 * To determine the flags, the service first fetches the licence information using the billLicenceId passed to it. This
 * includes details of which bill run it is being removed from.
 *
 * The service then checks which flags are already held on the licence so we can maintain these. Then depending on which
 * bill run batch type and or scheme the billLicenceId has been removed from we set the corresponding flag to true.
 *
 * The flags are then passed back to the service, where it will work out which years the two-part tariff flags should be
 * applied to if necessary.
 *
 * NOTE: Unlike pre-sroc and sroc flags (which apply at the licence level), two-part tariff flags are year specific.
 * They are stored in the `LicenceSupplementaryYears` table for each affected year.
 *
 * @param {string} billLicenceId - The UUID of the bill licence being removed from a bill run
 *
 * @returns {object} - An object containing the related licenceId, regionId, start and end date and
 * licence supplementary billing flags
 */
async function go(billLicenceId) {
  const { licence, bill, licenceId } = await _fetchBillLicence(billLicenceId)

  const { flagForPreSrocSupplementary, flagForSrocSupplementary, flagForTwoPartTariffSupplementary } = _updateFlags(
    bill,
    licence
  )

  const result = {
    licenceId,
    regionId: licence.regionId,
    startDate: new Date(`${bill.billRun.toFinancialYearEnding - 1}-04-01`),
    endDate: new Date(`${bill.billRun.toFinancialYearEnding}-03-31`),
    flagForPreSrocSupplementary,
    flagForSrocSupplementary,
    flagForTwoPartTariffSupplementary
  }

  return result
}

function _updateFlags(bill, licence) {
  // Set the flags to what they currently are on the licence
  let flagForSrocSupplementary = licence.includeInSrocBilling
  let flagForPreSrocSupplementary = licence.includeInPresrocBilling === 'yes'
  let flagForTwoPartTariffSupplementary = false

  if (bill.billRun.batchType === 'two_part_tariff' && bill.billRun.scheme === 'sroc') {
    flagForTwoPartTariffSupplementary = true
  } else {
    if (bill.billRun.scheme === 'alcs') {
      flagForPreSrocSupplementary = true
    } else {
      flagForSrocSupplementary = true
    }
  }

  return { flagForPreSrocSupplementary, flagForSrocSupplementary, flagForTwoPartTariffSupplementary }
}

async function _fetchBillLicence(billLicenceId) {
  return BillLicenceModel.query()
    .findById(billLicenceId)
    .select('licenceId')
    .withGraphFetched('licence')
    .modifyGraph('licence', (builder) => {
      builder.select(['regionId', 'includeInSrocBilling', 'includeInPresrocBilling'])
    })
    .withGraphFetched('bill')
    .modifyGraph('bill', (builder) => {
      builder.select(['id'])
    })
    .withGraphFetched('bill.billRun')
    .modifyGraph('bill.billRun', (builder) => {
      builder.select(['id', 'batchType', 'scheme', 'toFinancialYearEnding'])
    })
}

module.exports = {
  go
}
