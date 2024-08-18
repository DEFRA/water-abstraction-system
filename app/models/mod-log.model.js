'use strict'

/**
 * Model for mod log (water.mod_logs)
 * @module ModLogModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ModLogModel extends BaseModel {
  static get tableName () {
    return 'modLogs'
  }

  static get relationMappings () {
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
      }
    }
  }
}

module.exports = ModLogModel
