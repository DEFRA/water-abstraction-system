'use strict'

/**
 * Model for charge_version_workflows
 * @module WorkflowModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class WorkflowModel extends WaterBaseModel {
  static get tableName () {
    return 'chargeVersionWorkflows'
  }

  static get idColumn () {
    return 'chargeVersionWorkflowId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersionWorkflows.licenceId',
          to: 'licences.licenceId'
        }
      }
    }
  }
}

module.exports = WorkflowModel
