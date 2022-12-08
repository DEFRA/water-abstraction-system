'use strict'

/**
 * Model for water.billing_batches
 * @module BillingBatchModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class BillingBatchModel extends BaseModel {
  static get tableName () {
    return 'water.billing_batches'
  }

  static get relationMappings () {
    return {
      region: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'region.model',
        join: {
          from: 'water.billing_batches.region_id',
          to: 'water.regions.region_id'
        }
      }
    }
  }
}

module.exports = BillingBatchModel
