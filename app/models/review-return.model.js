'use strict'

/**
 * Model for review_returns
 * @module ReviewReturnModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewReturnModel extends BaseModel {
  static get tableName () {
    return 'reviewReturns'
  }

  // Defining which fields contain json allows us to insert an object without needing to stringify it first
  static get jsonAttributes () {
    return [
      'purposes'
    ]
  }

  static get relationMappings () {
    return {
      reviewResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-result.model',
        join: {
          from: 'reviewReturns.id',
          to: 'reviewResults.reviewReturnId'
        }
      }
    }
  }
}

module.exports = ReviewReturnModel
