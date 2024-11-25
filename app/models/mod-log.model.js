'use strict'

/**
 * Model for mod log (water.mod_logs)
 * @module ModLogModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ModLogModel extends BaseModel {
  static get tableName() {
    return 'modLogs'
  }

  static get relationMappings() {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'modLogs.chargeVersionId',
          to: 'chargeVersions.id'
        }
      },
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'modLogs.licenceId',
          to: 'licences.id'
        }
      },
      licenceVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence-version.model',
        join: {
          from: 'modLogs.licenceVersionId',
          to: 'licenceVersions.id'
        }
      },
      returnVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'return-version.model',
        join: {
          from: 'modLogs.returnVersionId',
          to: 'returnVersions.id'
        }
      }
    }
  }
}

module.exports = ModLogModel
