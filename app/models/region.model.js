'use strict'

/**
 * Model for regions
 * @module RegionModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class RegionModel extends BaseModel {
  static get tableName () {
    return 'regions'
  }

  static get idColumn () {
    return 'region_id'
  }

  static get relationMappings () {
    return {
      licences: {
        relation: Model.HasManyRelation,
        modelClass: 'licence.model',
        join: {
          from: 'regions.region_id',
          to: 'licences.region_id'
        }
      },
      billingBatches: {
        relation: Model.HasManyRelation,
        modelClass: 'billing_batch.model',
        join: {
          from: 'regions.region_id',
          to: 'billing_batches.region_id'
        }
      }
    }
  }
}

module.exports = RegionModel
