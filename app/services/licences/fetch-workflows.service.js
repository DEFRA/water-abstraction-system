'use strict'

/**
 * Fetches data needed for the view '/licences/{id}/licence-set-up` page
 * @module FetchWorkflowsService
 */

const WorkflowModel = require('../../models/workflow.model.js')

/**
 * Fetch the matching licence and return data needed for the view licence set up page
 *
 * Was built to provide the data needed for the '/licences/{id}/licence-set-up' page
 *
 * @param {string} licenceId The string for the licence to fetch
 *
 * @returns {Promise<Object>} the data needed to populate the view licence page's set up tab
 */
async function go (licenceId) {
  return _fetch(licenceId)
}

async function _fetch (licenceId) {
  return WorkflowModel.query()
    .where('licenceId', licenceId)
    .andWhere('deletedAt', null)
    .select([
      'id',
      'createdAt',
      'status',
      'licenceId',
      'data'
    ])
    .orderBy([
      { column: 'updatedAt', order: 'desc' }
    ])
}

// const getChargeVersionWorkflowLinks = (chargeVersionWorkflow, options) => {
//   const { licenceId, editChargeVersions, reviewChargeVersions } = options
//   if (chargeVersionWorkflow.status === 'to_setup' && editChargeVersions) {
//     return [
//       getLink('Set up', `/licences/${licenceId}/charge-information/create?chargeVersionWorkflowId=${chargeVersionWorkflow.id}`),
//       getLink('Remove', `/charge-information-workflow/${chargeVersionWorkflow.id}/remove`)
//     ]
//   } else if (reviewChargeVersions) {
//     return [
//       getLink('Review', `/licences/${licenceId}/charge-information/${chargeVersionWorkflow.id}/review`)
//     ]
//   }
//   return []
// }

//   ...get(chargeVersionWorkflow, 'chargeVersion', {}),
//   status: chargeVersionWorkflow.status,
//   id: chargeVersionWorkflow.id,
//   links: getChargeVersionWorkflowLinks(chargeVersionWorkflow, options)

// const CHARGE_VERSION_WORKFLOW_STATUS = {
//   review: 'review',
//   changesRequested: 'changes_requested',
//   toSetup: 'to_setup'
// }

module.exports = {
  go
}
