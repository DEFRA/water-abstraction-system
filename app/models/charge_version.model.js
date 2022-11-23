'use strict'

/**
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'water.chargeVersions'
  }

  static get relationMappings () {
    return {
      licences: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'water.charge_versions.licence_id',
          to: 'water.licences.licence_id'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
