'use strict'

/**
 * Used to generate the new bill run at the end of the create bill run journey
 * @module BillRunsCreateGenerateService
 */

const LegacyCreateBillRunService = require('../../legacy/create-bill-run.service.js')
const StartBillRunProcessService = require('../start-bill-run-process.service.js')

async function go (user, existsServiceResults) {
  const { matchResults, session, yearToUse } = existsServiceResults
  const { region: regionId, type, summer } = session.data

  const existingBillRun = matchResults[0]

  await _triggerBillRun(regionId, type, user, yearToUse, existingBillRun)
  await _triggerLegacyBillRun(regionId, type, user, yearToUse, summer, existingBillRun)

  return session.$query().delete()
}

async function _triggerLegacyBillRun (regionId, batchType, user, year, summer, existingBillRun = null) {
  // The one case we have to handle is where the user selected supplementary and a match was found, but it was to a
  // PRESROC supplementary bill run. We've got to this point in the process because it is fine to trigger the SROC
  // bill run in our engine. But we can't trigger the PRESROC one because a match already exists.
  if (batchType === 'supplementary' && existingBillRun?.scheme === 'alcs') {
    return null
  }

  return LegacyCreateBillRunService.go(batchType, regionId, year, user, summer)
}

async function _triggerBillRun (regionId, batchType, user, year, existingBillRun = null) {
  const { username: userEmail } = user

  // The one case we have to handle is where the user selected supplementary and a match was found, but it was to an
  // SROC supplementary bill run. We've got to this point in the process because it is fine to trigger the PRESROC
  // bill run in the legacy engine. But we can't trigger the SROC one because a match already exists.
  if (batchType === 'supplementary' && existingBillRun?.scheme === 'sroc') {
    return null
  }

  return StartBillRunProcessService.go(regionId, batchType, userEmail, year)
}

module.exports = {
  go
}
