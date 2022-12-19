'use strict'

/**
 * Model for water.charge_versions
 * @module ChargeVersionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ChargeVersionModel extends BaseModel {
  static get tableName () {
    return 'water.charge_versions'
  }

  static get idColumn () {
    return 'charge_version_id'
  }

  static get relationMappings () {
    return {
      licence: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'licence.model',
        join: {
          from: 'water.charge_versions.licence_id',
          to: 'water.licences.licence_id'
        }
      },
      chargeElement: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-element.model',
        join: {
          from: 'water.charge_versions.charge_version_id',
          to: 'water.charge_elements.charge_version_id'
        }
      }
    }
  }
}

module.exports = ChargeVersionModel
