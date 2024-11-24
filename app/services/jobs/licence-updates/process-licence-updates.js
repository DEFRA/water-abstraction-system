'use strict'

/**
 * Puts licences into workflow that have a licence version created in last 2 months and no existing workflow record
 * @module ProcessLicenceUpdatesService
 */

const FetchLicenceUpdatesService = require('./fetch-licence-updates.service.js')
const {
  calculateAndLogTimeTaken,
  currentTimeInNanoseconds,
  timestampForPostgres
} = require('../../../lib/general.lib.js')
const Workflow = require('../../../models/workflow.model.js')

/**
 * Puts licences into workflow that have a licence version created in last 2 months and no existing workflow record
 *
 * This replaces a legacy job in the
 * {@link https://github.com/DEFRA/water-abstraction-service | water-abstraction-service}. The intent is to flag any new
 * licence or licence with a new licence version. New licences will need their charge versions created. Existing ones
 * will need their charge versions double-checked.
 *
 * Ideally, this would be done at the same time the licence version is created by
 * {@link https://github.com/DEFRA/water-abstraction-import | water-abstraction-import}. But that wasn't done plus there
 * is a complication for the old PRESROC billing engine. WATER-3528 was found when licences linked to in-progress bill
 * runs were added to workflow (this is not an issue for our SROC billing engines).
 *
 * Instead, a job is run that looks for licence versions created in the last 2 months (we think the 2 month window was
 * to allow those licences linked to bill runs to still get flagged once the bill run is completed). If there is no
 * workflow record with a status of `to_setup` the licence is deemed to have been updated.
 *
 * This means a workflow record for the licence version needs to be created. This stops the licence from being included
 * in future bill runs until Billing & Data have had a chance to review the existing charge versions. This is because
 * the change to the licence might require changes to the charge versions.
 */
async function go() {
  try {
    const startTime = currentTimeInNanoseconds()

    const licenceUpdateResults = await FetchLicenceUpdatesService.go()

    await _addWorkflowRecords(licenceUpdateResults)

    calculateAndLogTimeTaken(startTime, 'Licence updates job complete', { count: licenceUpdateResults.length })
  } catch (error) {
    global.GlobalNotifier.omfg('Licence updates job failed', null, error)
  }
}

async function _addWorkflowRecords(licenceVersions) {
  const timestamp = timestampForPostgres()

  for (const licenceVersion of licenceVersions) {
    const { id: licenceVersionId, licenceId, chargeVersionExists } = licenceVersion

    await Workflow.query().insert({
      data: { chargeVersion: null, chargeVersionExists },
      licenceId,
      licenceVersionId,
      status: 'to_setup',
      createdAt: timestamp,
      updatedAt: timestamp
    })
  }
}

module.exports = {
  go
}
