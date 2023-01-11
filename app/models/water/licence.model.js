'use strict'

/**
 * Model for licences
 * @module LicenceModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class LicenceModel extends WaterBaseModel {
  static get tableName () {
    return 'licences'
  }

  static get idColumn () {
    return 'licenceId'
  }

  static get translations () {
    return [
      { database: 'dateCreated', model: 'createdAt' },
      { database: 'dateUpdated', model: 'updatedAt' }
    ]
  }

  static get relationMappings () {
    return {
      chargeVersions: {
        relation: Model.HasManyRelation,
        modelClass: 'charge-version.model',
        join: {
          from: 'licences.licenceId',
          to: 'chargeVersions.licenceId'
        }
      },
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'licences.regionId',
          to: 'regions.regionId'
        }
      }
    }
  }
}

module.exports = LicenceModel
