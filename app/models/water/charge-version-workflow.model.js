'use strict'

/**
 * Model for chargeVersionWorkflows
 * @module ChargeVersionWorkflowModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class ChargeVersionWorkflowModel extends WaterBaseModel {
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

module.exports = ChargeVersionWorkflowModel
