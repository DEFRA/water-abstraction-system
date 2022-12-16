'use strict'

/**
 * Model for water.charge_elements
 * @module ChargeElementModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeElementModel extends BaseModel {
  static get tableName () {
    return 'water.charge_elements'
  }

  static get relationMappings () {
    return {
      chargeVersion: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'water.charge_elements.charge_version_id',
          to: 'water.charge_versions.charge_version_id'
        }
      }
    }
  }
}

module.exports = ChargeElementModel
