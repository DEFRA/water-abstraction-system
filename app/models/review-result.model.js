'use strict'

/**
 * Model for review_results
 * @module ReviewResultModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewResultModel extends BaseModel {
  static get tableName () {
    return 'reviewResults'
  }

  static get relationMappings () {
    return {
      reviewChargeElementResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-charge-element-result.model',
        join: {
          from: 'reviewResults.reviewChargeElementResultId',
          to: 'reviewChargeElementResults.id'
        }
      },
      reviewReturnResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-return-result.model',
        join: {
          from: 'reviewResults.reviewReturnResultId',
          to: 'reviewReturnResults.id'
        }
      }
    }
  }
}

module.exports = ReviewResultModel
