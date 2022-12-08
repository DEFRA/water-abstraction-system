'use strict'

/**
 * Model for water.licences
 * @module LicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceModel extends BaseModel {
  static get tableName () {
    return 'water.licences'
  }

  static get relationMappings () {
    return {
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'water.licences.licence_id',
          to: 'water.charge_versions.licence_id'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'water.licences.region_id',
          to: 'water.regions.region_id'
        }
      }
    }
  }
}

module.exports = LicenceModel
