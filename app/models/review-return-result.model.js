'use strict'

/**
 * Model for review_return_results
 * @module ReviewReturnResultModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewReturnResultModel extends BaseModel {
  static get tableName () {
    return 'reviewReturnResults'
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
          from: 'reviewReturnResults.id',
          to: 'reviewResults.reviewReturnResultId'
        }
      }
    }
  }
}

module.exports = ReviewReturnResultModel
