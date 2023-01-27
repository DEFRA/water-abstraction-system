'use strict'

/**
 * Fetches a region based on the NALD region ID provided
 * @module FetchLicencesService
 */

const { db } = require('../../../db/db.js')

/**
 * Fetches licences flagged for supplementary billing that are linked to the selected region
 *
 * This is a temporary service to help us confirm we are selecting the correct data to use when creating a
 * supplementary bill run. Its primary aim is to meet the acceptance criteria defined in WATER-3787.
 *
 * @param {Object} region Instance of `RegionModel` for the selected region
 *
 * @returns {Object[]} Array of matching `LicenceModel`
 */
async function go (region, billingPeriodFinancialYearEnding) {
  const licences = await _fetch(region, billingPeriodFinancialYearEnding)

  return licences
}

async function _fetch (region, billingPeriodFinancialYearEnding) {
  const result = db
    .select('l.licenceId', 'l.licenceRef')
    .count('billed.licenceId as numberOfTimesBilled')
    .distinctOn('l.licenceId')
    .from('water.licences as l')
    .leftOuterJoin(
      db
        .select('bil.licenceId')
        .from('water.billingInvoiceLicences as bil')
        .innerJoin('water.billingInvoices as bi', 'bil.billingInvoiceId', 'bi.billingInvoiceId')
        .innerJoin('water.billingBatches as bb', 'bi.billingBatchId', 'bb.billingBatchId')
        .where({
          'bi.financialYearEnding': billingPeriodFinancialYearEnding,
          'bb.status': 'sent',
          'bb.scheme': 'sroc'
        }).as('billed'),
      'l.licenceId', 'billed.licenceId'
    )
    .where({
      'l.includeInSupplementaryBilling': 'yes',
      'l.regionId': region.regionId
    })
    .groupBy('l.licenceId')

  return result
}

module.exports = {
  go
}
