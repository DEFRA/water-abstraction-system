'use strict'

/**
 * Model for charge_versions (water.charge_version_workflows)
 * @module ChargeVersionWorkflowModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionWorkflowModel extends BaseModel {
  static get tableName () {
    return 'chargeVersionWorkflows'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'chargeVersionWorkflows.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licenceVersions.model',
        join: {
          from: 'chargeVersionWorkflows.licenceVersionId',
          to: 'licenceVersions.id'
        }
      }
    }
  }
}

module.exports = ChargeVersionWorkflowModel
