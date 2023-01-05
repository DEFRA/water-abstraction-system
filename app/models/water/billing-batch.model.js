'use strict'

/**
 * Model for billingBatches
 * @module BillingBatchModel
 */

const { Model } = require('objection')

const WaterBaseModel = require('./water-base.model.js')

class BillingBatchModel extends WaterBaseModel {
  static get tableName () {
    return 'billingBatches'
  }

  static get idColumn () {
    return 'billingBatchId'
  }

  static get relationMappings () {
    return {
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'billingBatches.regionId',
          to: 'regions.regionId'
        }
      }
    }
  }
}

module.exports = BillingBatchModel
