'use strict'

/**
 * Check the end dates of the licence between NALD and WRLS and process if necessary
 * @module ProcessLicenceChangesService
 */

const DetermineEarliestLicenceChangedDateService = require('./determine-earliest-licence-changed-date.service.js')
const ProcessBillingFlagService = require('../../licences/supplementary/process-billing-flag.service.js')
const ProcessLicenceReturnLogsService = require('../../return-logs/process-licence-return-logs.service.js')

const FeatureFlags = require('../../../../config/feature-flags.config.js')

/**
 * Check the end dates of the licence between NALD and WRLS and process if necessary
 *
 * @param {object} licence - The licence to process
 */
async function go(licence) {
  try {
    const changedDateDetails = DetermineEarliestLicenceChangedDateService.go(licence)

    if (!changedDateDetails) {
      return
    }

    await _supplementaryBillingFlags(licence, changedDateDetails)
    await _returnLogs(licence, changedDateDetails)
  } catch (error) {
    global.GlobalNotifier.omfg('Licence changes processing failed', { id: licence.id }, error)
  }
}

async function _returnLogs(licence, changedDateDetails) {
  if (FeatureFlags.enableRequirementsForReturns) {
    await ProcessLicenceReturnLogsService.go(licence.id, changedDateDetails.changeDate)
  }
}

async function _supplementaryBillingFlags(licence, changedDateDetails) {
  const payload = { licenceId: licence.id, changedDateDetails }

  await ProcessBillingFlagService.go(payload)
}

module.exports = {
  go
}
