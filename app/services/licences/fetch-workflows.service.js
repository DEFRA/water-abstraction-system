'use strict'

/**
 * Fetches workflow data needed for the view '/licences/{id}/set-up` page
 * @module FetchWorkflowsService
 */

const WorkflowModel = require('../../models/workflow.model.js')

/**
 * Fetches workflow data needed for the view '/licences/{id}/set-up` page
 *
 * @param {string} licenceId - The UUID for the licence to fetch workflow data for
 *
 * @returns {Promise<object>} the data needed to populate the view licence page's set up tab
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
      { column: 'createdAt', order: 'desc' }
    ])
}

module.exports = {
  go
}
