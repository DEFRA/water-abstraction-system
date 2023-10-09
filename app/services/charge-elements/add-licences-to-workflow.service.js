'use strict'

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in 50 days or less
 * @module AddLicencesToWorkflowService
 */

const { db } = require('../../../db/db.js')
const Workflow = require('../../models/water/workflow.model.js')

/**
 * Puts SROC licences into workflow that have a related `purpose` that is due to expire in 50 days or less
 *
 * To be added to the workflow the licence must
 *
 * - not have expired
 * - not be revoked
 * - not have lapsed
 * - have an 'sroc' charge version with the status of `current` that does not have an `endDate`. The lack of an endDate
 * indicates that the charge version is the latest and has not been replaced/superseded etc
 * - not be linked to a licence in the workflow
 * - have a related `purpose` that is due to expire in 50 days or less
 *
 * @returns {Object} Contains an array of unique licence IDs & version IDs that have been added to the workflow
 */
async function go () {
  const licencesForWorkflow = await _fetch()

  if (licencesForWorkflow.length) {
    await _addLicenceToWorkflow(licencesForWorkflow)
  }

  return licencesForWorkflow
}

async function _addLicenceToWorkflow (licencesForWorkflow) {
  // Attach additional data to the array that the chargeVersionWorkflow table requires to create a valid record
  licencesForWorkflow.forEach((licenceForWorkflow) => {
    licenceForWorkflow.status = 'to_setup'
    licenceForWorkflow.data = { chargeVersion: null }
    licenceForWorkflow.createdAt = new Date()
    licenceForWorkflow.updatedAt = new Date()
  })

  await Workflow.query().insert(licencesForWorkflow)
}

async function _fetch () {
  return db
    .distinct('l.licenceId', 'lv.licenceVersionId')
    .from('water.licences as l')
    .innerJoin('water.licenceVersions as lv', 'l.licenceId', 'lv.licenceId')
    .innerJoin('water.chargeVersions as cv', 'l.licenceId', 'cv.licenceId')
    .innerJoin('water.chargeElements as ce', 'cv.chargeVersionId', 'ce.chargeVersionId')
    .innerJoin('water.chargePurposes as cp', 'ce.chargeElementId', 'cp.chargeElementId')
    .where((builder) => {
      builder
        .whereNull('l.expiredDate')
        .orWhere('l.expiredDate', '>', new Date())
    })
    .whereNull('l.revokedDate')
    .whereNull('l.lapsedDate')
    .where('lv.status', 'current')
    .whereNull('cv.endDate')
    .where('cv.scheme', 'sroc')
    .where('cv.status', 'current')
    .whereNotNull('cp.timeLimitedEndDate')
    .where('cp.timeLimitedEndDate', '<', new Date(new Date() - _convertDaysToMilliseconds(50)))
    .whereNotExists(
      db
        .select(1)
        .from('water.chargeVersionWorkflows as cvw')
        .whereColumn('l.licenceId', 'cvw.licenceId')
        .whereNull('cvw.dateDeleted')
    )
}

function _convertDaysToMilliseconds (days) {
  return days * 24 * 60 * 60 * 1000
}

module.exports = {
  go
}
