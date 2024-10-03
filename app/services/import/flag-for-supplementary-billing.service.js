'use strict'

/**
 * Determines if a licence should be flagged for supplementary billing
 * @module FlagForSupplementaryBillingService
 */

const DetermineSupplementaryBillingFlagsService = require('../licences/supplementary/determine-supplementary-billing-flags.service.js')
const LicenceModel = require('../../models/licence.model.js')

/**
 * Determines if a licence should be flagged for supplementary billing.
 *
 * This service is responsible for determining whether a licence imported from NALD should be flagged for
 * supplementary billing. It compares the licences end dates (such as lapsed, revoked or expired dates) between WRLS
 * and the transformed data, and if there is a change in the dates allows the licence to go on to determining the flags.
 * @param {object} naldLicence - the legacy NALD licence
 * @param {object} wrlsLicenceId - the WRLS licence data
 */
async function go (naldLicence, wrlsLicenceId) {
  try {
    const licenceChanged = await _licenceChanged(naldLicence, wrlsLicenceId)

    if (!licenceChanged) {
      return
    }

    await DetermineSupplementaryBillingFlagsService.go(naldLicence, wrlsLicenceId)
  } catch (error) {
    global.GlobalNotifier.omfg('Supplementary Billing Flag failed for licence ', wrlsLicenceId, error)
  }
}

async function _licenceChanged (naldLicence, wrlsLicenceId) {
  const query = LicenceModel.query()
    .select(['id'])
    .where('id', wrlsLicenceId)

  _whereClauses(query, naldLicence)

  const result = await query

  return result.length === 0
}

function _whereClauses (query, naldLicence) {
  const { expiredDate, lapsedDate, revokedDate } = naldLicence

  if (expiredDate) {
    query.where('expiredDate', expiredDate)
  } else {
    query.whereNull('expiredDate')
  }

  if (revokedDate) {
    query.where('revokedDate', revokedDate)
  } else {
    query.whereNull('revokedDate')
  }

  if (lapsedDate) {
    query.where('lapsedDate', lapsedDate)
  } else {
    query.whereNull('lapsedDate')
  }
}

module.exports = {
  go
}
