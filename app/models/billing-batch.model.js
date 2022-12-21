'use strict'

/**
 * Model for billing_batches
 * @module BillingBatchModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingBatchModel extends BaseModel {
  static get tableName () {
    return 'billing_batches'
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
          from: 'billing_batches.region_id',
          to: 'regions.region_id'
        }
      }
    }
  }
}

module.exports = BillingBatchModel
