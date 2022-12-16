'use strict'

/**
 * Model for billingBatches
 * @module BillingBatchModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingBatchModel extends BaseModel {
  static get tableName () {
    return 'billingBatches'
  }

  static get idColumn () {
    return 'billingBatchId'
  }

  static get idColumn () {
    return 'billing_batch_id'
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
