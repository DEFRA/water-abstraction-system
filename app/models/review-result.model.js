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
      reviewChargeElements: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-charge-element.model',
        join: {
          from: 'reviewResults.reviewChargeElementId',
          to: 'reviewChargeElements.id'
        }
      },
      reviewReturns: {
        relation: Model.BelongsToOneRelation,
        modelClass: 'review-return.model',
        join: {
          from: 'reviewResults.reviewReturnId',
          to: 'reviewReturns.id'
        }
      }
    }
  }
}

module.exports = ReviewResultModel
