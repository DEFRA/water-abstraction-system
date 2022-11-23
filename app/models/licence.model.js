'use strict'

/**
 * @module LicenceModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class LicenceModel extends BaseModel {
  static get tableName () {
    return 'licences'
  }

  static get relationMappings () {
    return {
      chargeVersions: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'charge_version.model',
        join: {
          from: 'licences.licence_id',
          to: 'charge_versions.licence_id'
        }
      },
      regions: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'licences.region_id',
          to: 'regions.region_id'
        }
      }
    }
  }
}

module.exports = LicenceModel
