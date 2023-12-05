'use strict'

/**
 * Model for review_charge_element_results
 * @module ReviewChargeElementResultModel
 */

const { Model } = require('objection')

const BaseModel = require('./base.model.js')

class ReviewChargeElementResultModel extends BaseModel {
  static get tableName () {
    return 'reviewChargeElementResults'
  }

  static get relationMappings () {
    return {
      reviewResults: {
        relation: Model.HasManyRelation,
        modelClass: 'review-result.model',
        join: {
          from: 'reviewChargeElementResults.id',
          to: 'reviewResults.reviewChargeElementResultId'
        }
      }
    }
  }
}

module.exports = ReviewChargeElementResultModel
