'use strict'

/**
 * Model for regions
 * @module RegionModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class RegionModel extends WaterBaseModel {
  static get tableName () {
    return 'regions'
  }

  static get idColumn () {
    return 'regionId'
  }

  static get relationMappings () {
    return {
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'licence.model',
        join: {
          from: 'regions.regionId',
          to: 'licences.regionId'
        }
      },
      billingBatches: {
        relation: Model.HasManyRelation,
        modelClass: 'billing-batch.model',
        join: {
          from: 'regions.regionId',
          to: 'billingBatches.regionId'
        }
      }
    }
  }
}

module.exports = RegionModel
