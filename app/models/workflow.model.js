'use strict'

/**
 * Model for workflows
 * @module WorkflowModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class WorkflowModel extends BaseModel {
  static get tableName () {
    return 'workflows'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'workflows.licenceId',
          to: 'licences.id'
        }
      }
    }
  }
}

module.exports = WorkflowModel
